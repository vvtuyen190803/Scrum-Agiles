import { useState, FormEvent, ChangeEvent } from "react";
import { registerApi } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface RegisterForm {
    username: string;
    email: string;
    password: string;
}
export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterForm>({
        username: "",
        email: "",
        password: ""
        
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!form.username || !form.password) {
            setError("Please fill in all fields");
            return;
        }
        try {
            await registerApi({"user": {
                username: form.username,
                email: form.email,
                password: form.password,
            }})
        setSuccess("Register successfully. Please login.");
        setTimeout(() => navigate("/login"), 1000);
    } catch {
        setError("Register failed");
    }
};
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f5f5f5"
        }}>
            <form onSubmit={handleSubmit} style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "400px"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#333"
                }}>Register</h2>
                
                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#555"
                    }}>Username</label>
                    <input 
                        name="username" 
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "16px",
                            boxSizing: "border-box"
                        }}
                        placeholder="Enter your username"
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#555"
                    }}>Email</label>
                    <input 
                        name="email" 
                        type="email"
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "16px",
                            boxSizing: "border-box"
                        }}
                        placeholder="Enter your email"
                    />
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#555"
                    }}>Password</label>
                    <input 
                        name="password" 
                        type="password" 
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "16px",
                            boxSizing: "border-box"
                        }}
                        placeholder="Enter your password"
                    />
                </div>

                {success && <p style={{ 
                    color: "green", 
                    textAlign: "center",
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "6px"
                }}>{success}</p>}
                
                {error && <p style={{ 
                    color: "#d32f2f", 
                    textAlign: "center",
                    marginBottom: "15px",
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    borderRadius: "6px"
                }}>{error}</p>}

                <button type="submit" style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                }}>Register</button>

                <p style={{ 
                    textAlign: "center", 
                    marginTop: "20px",
                    color: "#666"
                }}>
                    Already have an account? <a href="/login" style={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontWeight: "500"
                    }}>Login here</a>
                </p>
            </form>
        </div>
    );
};