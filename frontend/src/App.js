import './App.css';
import MapContainer from "./MapContainer";
import plot from "./plot_no_background.png";
import Email from "./Email";

function App() {
  return (
    <div className="App">
      <main>
        <div class='flexbox-container'>
          <div className='black-container'>
            <div className='plot-name'>Plot</div>
            <img src={plot} alt="Plot Image" className='plot-image'/>
            <p>Click on a garden to see more details</p>
            <div className='join-button-container'>
              <button className='join-button'>Join Garden</button>
            </div>
            <div className='add-button-container'>
              <button className='add-button' onClick={MapContainer.newGardenCallback}>Create Garden</button>
            </div>
            <div className='confirm-button-container'>
              <button className='confirm-button' onClick={MapContainer.confirmCallback}>Confirm</button>
            </div>
            <div className='back-button-container'>
              <button className='back-button' onClick={MapContainer.backToMapCallback}>Back</button>
            </div>
            <Email />
          </div>
          <MapContainer id='google-map-main' />
        </div>
      </main>
    </div>
  );
}

export default App;
