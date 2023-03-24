import React, { useState } from "react";
import axios from "axios";
import Dropzone from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { Progress } from "reactstrap";
import { S3 } from "aws-sdk";
import ReactPlayer from "react-player";

const App = () => {
	const [progress, setProgress] = useState(0);
	const [videoUrl, setVideoUrl] = useState("");
	const [uploading, setUploading] = useState(false);

	const handleDrop = async (acceptedFiles) => {
		const file = acceptedFiles[0];
		const s3 = new S3({
			accessKeyId: import.meta.env.VITE_ACCESS_KEY_ID,
			secretAccessKey: import.meta.env.VITE_SECRET_ACCESS_KEY,
			region: import.meta.env.VITE_BUCKET_REGION,
		});

		const params = {
			Bucket: import.meta.env.VITE_BUCKET_NAME,
			Key: `${uuidv4()}_${file.name}`,
			ContentType: file.type,
			Body: file,
		};

		try {
			const response = await s3
				.upload(params)
				.on("httpUploadProgress", (progress) => {
					setProgress(Math.round((progress.loaded / progress.total) * 100));
				})
				.promise();
			console.log(response);
			setVideoUrl(response.Location);
			setUploading(false);
		} catch (error) {
			console.log(error);
			setUploading(false);
		}
	};

	return (
		<div className="container">
			{!videoUrl && (
				<Dropzone
					onDrop={handleDrop}
					accept="video/mp4"
					multiple={false}
					disabled={uploading}
					style={{
						border: "2px dashed #ccc",
						margin: "30px",
						padding: "30px",
					}}>
					{({ getRootProps, getInputProps }) => (
						<div {...getRootProps()}>
							<input {...getInputProps()} />
							<p>Drag and drop an mp4 file here, or click to select file</p>
						</div>
					)}
				</Dropzone>
			)}
			{uploading && (
				<div>
					<Progress value={progress} />
					<p>Uploading... {progress}%</p>
				</div>
			)}
			{videoUrl && (
				<div>
					<ReactPlayer
						url={videoUrl}
						controls={true}
						width="100%"
						height="500px"
					/>
				</div>
			)}
		</div>
	);
};

export default App;
