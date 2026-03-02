import sys
import os
import cv2
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QFileDialog, QDoubleSpinBox,
    QProgressBar, QTextEdit, QMessageBox, QGroupBox, QFormLayout
)
from PySide6.QtCore import QThread, Signal, Slot, Qt

# ==========================================
# THREAD XỬ LÝ LOGIC (WORKER THREAD)
# ==========================================
class BatchExtractionWorker(QThread):
    # Định nghĩa các Signals để giao tiếp với Main UI Thread
    progress_updated = Signal(int)
    log_updated = Signal(str)
    finished = Signal()
    error_occurred = Signal(str)

    def __init__(self, video_files: list, output_dir: str, interval_sec: float):
        super().__init__()
        self.video_files = video_files
        self.output_dir = output_dir
        self.interval_sec = interval_sec
        self._is_running = True  # Cờ trạng thái để kiểm soát Dừng/Hủy

    def stop(self):
        """Hàm để nhận tín hiệu dừng từ UI"""
        self._is_running = False

    def run(self):
        """Hàm thực thi chính của Thread. Sẽ chạy khi gọi start()"""
        total_videos = len(self.video_files)
        
        try:
            for i, video_path in enumerate(self.video_files):
                if not self._is_running:
                    self.log_updated.emit("\n⚠️ Đã hủy quá trình trích xuất bởi người dùng.")
                    break

                cap = None
                try:
                    video_name = os.path.basename(video_path)
                    self.log_updated.emit(f"\n[{i+1}/{total_videos}] Đang xử lý video: {video_name}...")
                    cap = cv2.VideoCapture(video_path)

                    if not cap.isOpened():
                        self.log_updated.emit(f"❌ Bỏ qua: Không thể đọc được file {video_name}.")
                        continue

                    # Lấy thông số kỹ thuật của video
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

                    if fps == 0 or total_frames == 0:
                        self.log_updated.emit(f"❌ Bỏ qua: Video {video_name} không hợp lệ.")
                        continue

                    duration = total_frames / fps
                    total_expected_frames = int(duration / self.interval_sec) + 1
                    
                    self.log_updated.emit(f"-> FPS: {fps:.2f} | Tổng thời gian: {duration:.2f}s")
                    self.log_updated.emit(f"-> Số ảnh dự kiến: ~{total_expected_frames}")

                    base_name = os.path.splitext(video_name)[0]
                    current_sec = 0.0
                    step_count = 0

                    # Vòng lặp trích xuất cho từng video
                    while current_sec <= duration:
                        if not self._is_running:
                            break

                        # Tính toán Frame ID tương ứng với thời gian
                        frame_id = int(current_sec * fps)
                        
                        # TỐI ƯU HIỆU SUẤT: Nhảy cóc đến đích thay vì đọc từng frame
                        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
                        ret, frame = cap.read()

                        if ret:
                            filename = f"{base_name}_time_{current_sec:.2f}s.jpg"
                            filepath = os.path.join(self.output_dir, filename)
                            cv2.imwrite(filepath, frame)
                            self.log_updated.emit(f"  + Đã lưu: {filename}")
                        else:
                            self.log_updated.emit(f"  - Cảnh báo: Không thể đọc frame tại giây {current_sec:.2f}")

                        # Cập nhật tiến trình tổng thể
                        current_sec += self.interval_sec
                        step_count += 1
                        
                        # Tính % tiến trình dựa trên tổng số video và tiến trình của video hiện tại
                        video_progress = min(1.0, step_count / total_expected_frames)
                        overall_progress = int(((i + video_progress) / total_videos) * 100)
                        self.progress_updated.emit(overall_progress)

                finally:
                    # Đảm bảo giải phóng cap sau mỗi video
                    if cap is not None:
                        cap.release()

            if self._is_running:
                self.progress_updated.emit(100)
                self.log_updated.emit("\n✅ Hoàn thành trích xuất toàn bộ thư mục!")

        except Exception as e:
            self.error_occurred.emit(str(e))
        finally:
            self.finished.emit()


# ==========================================
# LỚP GIAO DIỆN CHÍNH (MAIN UI)
# ==========================================
class VideoFrameExtractorUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Batch Video Frame Extractor")
        self.resize(650, 500)
        
        self.worker = None
        self.setup_ui()

    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # --- Group Input ---
        input_group = QGroupBox("Cấu hình Đầu vào / Đầu ra")
        input_layout = QFormLayout(input_group)

        # 1. Input Folder
        self.input_dir_edit = QLineEdit()
        self.input_dir_edit.setReadOnly(True)
        self.btn_browse_input = QPushButton("Chọn thư mục Video")
        self.btn_browse_input.clicked.connect(self.browse_input)
        
        input_dir_layout = QHBoxLayout()
        input_dir_layout.addWidget(self.input_dir_edit)
        input_dir_layout.addWidget(self.btn_browse_input)
        input_layout.addRow("Thư mục Video:", input_dir_layout)

        # 2. Output Folder
        self.output_dir_edit = QLineEdit()
        self.output_dir_edit.setReadOnly(True)
        self.btn_browse_output = QPushButton("Chọn thư mục Lưu")
        self.btn_browse_output.clicked.connect(self.browse_output)
        
        output_layout = QHBoxLayout()
        output_layout.addWidget(self.output_dir_edit)
        output_layout.addWidget(self.btn_browse_output)
        input_layout.addRow("Thư mục Lưu:", output_layout)

        # 3. Interval Input
        self.interval_spinbox = QDoubleSpinBox()
        self.interval_spinbox.setRange(0.1, 3600.0)
        self.interval_spinbox.setValue(3.0)  # Đổi mặc định thành 3 giây
        self.interval_spinbox.setSuffix(" giây")
        self.interval_spinbox.setSingleStep(0.5)
        input_layout.addRow("Khoảng cách (Interval):", self.interval_spinbox)

        main_layout.addWidget(input_group)

        # --- Progress Bar ---
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.progress_bar)

        # --- Control Buttons ---
        btn_layout = QHBoxLayout()
        self.btn_start = QPushButton("Bắt đầu trích xuất")
        self.btn_start.setStyleSheet("background-color: #2E8B57; color: white; font-weight: bold; padding: 5px;")
        self.btn_start.clicked.connect(self.start_extraction)
        
        self.btn_stop = QPushButton("Dừng / Hủy")
        self.btn_stop.setStyleSheet("background-color: #DC143C; color: white; font-weight: bold; padding: 5px;")
        self.btn_stop.setEnabled(False)
        self.btn_stop.clicked.connect(self.stop_extraction)
        
        btn_layout.addWidget(self.btn_start)
        btn_layout.addWidget(self.btn_stop)
        main_layout.addLayout(btn_layout)

        # --- Log Terminal ---
        main_layout.addWidget(QLabel("Log Terminal:"))
        self.log_terminal = QTextEdit()
        self.log_terminal.setReadOnly(True)
        self.log_terminal.setStyleSheet("background-color: #1E1E1E; color: #00FF00; font-family: Consolas;")
        main_layout.addWidget(self.log_terminal)

    @Slot()
    def browse_input(self):
        dirpath = QFileDialog.getExistingDirectory(self, "Chọn thư mục chứa Video")
        if dirpath:
            self.input_dir_edit.setText(dirpath)

    @Slot()
    def browse_output(self):
        dirpath = QFileDialog.getExistingDirectory(self, "Chọn thư mục lưu ảnh")
        if dirpath:
            self.output_dir_edit.setText(dirpath)

    @Slot()
    def start_extraction(self):
        input_dir = self.input_dir_edit.text()
        output_dir = self.output_dir_edit.text()
        interval = self.interval_spinbox.value()

        if not input_dir or not os.path.exists(input_dir):
            QMessageBox.warning(self, "Lỗi", "Vui lòng chọn thư mục chứa video hợp lệ.")
            return
        if not output_dir or not os.path.exists(output_dir):
            QMessageBox.warning(self, "Lỗi", "Vui lòng chọn thư mục lưu ảnh hợp lệ.")
            return

        # Quét tìm các file video trong thư mục
        supported_formats = ('.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv')
        video_files = [
            os.path.join(input_dir, f) for f in os.listdir(input_dir)
            if f.lower().endswith(supported_formats) and os.path.isfile(os.path.join(input_dir, f))
        ]

        if not video_files:
            QMessageBox.warning(self, "Lỗi", "Không tìm thấy file video nào trong thư mục đã chọn.")
            return

        # Cập nhật UI
        self.btn_start.setEnabled(False)
        self.btn_stop.setEnabled(True)
        self.progress_bar.setValue(0)
        self.log_terminal.clear()
        self.log_terminal.append(f"Tìm thấy {len(video_files)} video. Bắt đầu xử lý...")

        # Khởi tạo Worker
        self.worker = BatchExtractionWorker(video_files, output_dir, interval)
        self.worker.progress_updated.connect(self.update_progress)
        self.worker.log_updated.connect(self.append_log)
        self.worker.error_occurred.connect(self.show_error)
        self.worker.finished.connect(self.on_worker_finished)
        
        self.worker.start()

    @Slot()
    def stop_extraction(self):
        if self.worker and self.worker.isRunning():
            self.append_log("Đang gửi tín hiệu dừng...")
            self.worker.stop()
            self.btn_stop.setEnabled(False)

    @Slot(int)
    def update_progress(self, value: int):
        self.progress_bar.setValue(value)

    @Slot(str)
    def append_log(self, message: str):
        self.log_terminal.append(message)
        scrollbar = self.log_terminal.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())

    @Slot(str)
    def show_error(self, err_msg: str):
        self.append_log(f"❌ Lỗi hệ thống: {err_msg}")
        QMessageBox.critical(self, "Lỗi xảy ra", err_msg)

    @Slot()
    def on_worker_finished(self):
        self.btn_start.setEnabled(True)
        self.btn_stop.setEnabled(False)
        self.worker.deleteLater()
        self.worker = None


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = VideoFrameExtractorUI()
    window.show()
    sys.exit(app.exec())