import { useState } from "react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";

function FileForm(){
    const [files, setFiles] = useState([]);
    
    const handleFileInputChange = (event) => {
        setFiles(Array.from(event.target.files))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        files.forEach(file => {
            formData.append('file_uploads', file);
        });

        try {
            const endpoint = "http://localhost:8000/uploadfile/"
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData      
            });

            if (response.ok){
                console.log("File uploaded sucessfully!");
            } else { 
                console.log("Failed to upload file.");
            }
        } catch(e){
            console.error(e);
        }
    }

    return (
        <div>
            <Heading marginBottom="2">Upload File</Heading>

            <form onSubmit={handleSubmit}>
                <Flex direction="column">
                    {/* Wrapping file input into Chakra UI Button component */}
                    <Flex marginBottom="3">
                        <Button as="label" htmlFor="fileInput" colorScheme="blue" cursor="pointer">
                            Select File
                            <input
                                id="fileInput"
                                type="file"
                                onChange={handleFileInputChange}
                                multiple
                                style={{ display: "none" }}
                            />
                        </Button>
                        <Text marginLeft="2">{files.length} files selected</Text>
                    </Flex>
                    
                    {/* Chakra UI button component for upload */}
                    <Button type="submit" colorScheme="blue">Upload</Button>
                </Flex>
            </form>
        </div>
    )
}

export default FileForm