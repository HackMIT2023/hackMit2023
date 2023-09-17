import './App.css';
import MapContainer from "./MapContainer";
import plot from "./plot_no_background.png";

function App() {
  return (
    <div className="App">
      <main>
        <div className='flexbox-container'>
          <div className='black-container'>
            <div className='plot-name'>Plot</div>
            <img src={plot} alt="Plot" className='plot-image'/>
            <p id='more-info-label'>Click on a garden to see more details</p>
            <p id = "garden-name"></p>
            <p id = "member-count"></p>
            <p id = "plants-list"></p>
            <p><input type="text" id="new-garden-textbox" placeholder="Garden Name" /></p>
            <table id="plants-table"></table>
            <div className='join-button-container'>
              <button className='join-button' id='join-button' onClick={MapContainer.joinCallback}>Join Garden</button>
            </div>
            <div className='create-button-container'>
              <button className='create-button' id='create-button' onClick={MapContainer.newGardenCallback}>Create Garden</button>
            </div>
            <div className='confirm-button-container'>
              <button className='confirm-button' id='confirm-button' onClick={MapContainer.confirmCallback}>Confirm</button>
            </div>
            <div className='back-button-container'>
              <button className='back-button' id='back-button' onClick={MapContainer.backToMapCallback}>Back</button>
            </div>
          </div>
          <MapContainer id='google-map-main' />
        </div>
      </main>
    </div>
  );
}

export default App;
