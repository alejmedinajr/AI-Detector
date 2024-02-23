import { useState } from "react";

function FileForm(){
    const [file, setFile] = useState(null);
    
    const handleFileInputChange = (event) => {
        setFile(event.target.files[0])
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('file_upload');
    }

    return (
        <div>
            <h1>Upload File</h1>

            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: "20px"}}>
                    <input type="file" onChange={handleFileInputChange} />
                </div>
                
                <button type="submit">Upload</button>
            </form>
            { file && <p>{file.name}</p>}
        </div>
    )
}

export default FileForm