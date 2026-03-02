import React from 'react'

const English = () => {
  return (
    <>
    <div>English</div>
    <input type="text" placeholder="Type here..."/>
    <button type="button" aria-label="Submit" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'lightblue'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''} onClick={() => alert('Submitted')}>Submit</button>
    </>
  )
}

export default English