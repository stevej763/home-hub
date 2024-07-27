import './Doorcam.css'

const streamingServer = process.env.REACT_APP_STREAMING_SERVER;
const port = process.env.REACT_APP_STREAMING_PORT;

const DoorcamPage = () => {

    return (
        <div className='CameraContainer'>
            <img src={`http://${streamingServer}:${port}/stream`} width="720" height="415" alt="Doorcam Stream" />
            </div>
    )
}

export default DoorcamPage;