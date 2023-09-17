import './App.css';
import MapContainer from "./MapContainer";
import plot from "./plot_no_background.png";

function App() {
  return (
    <div className="App">
      <div className='black-container'>
        <div className='plot-name'>Plot</div>
        <img src={plot} alt="Plot Image" className='plot-image'/>
        <p>Click on a garden to see more details</p>
        <div className='join-button-container'>
          <button className='join-button'>Join Garden</button>
        </div>

        <div className='add-button-container'>
          <button className='add-button'>Create Garden</button>
        </div>
      </div>
      
      <main>
        <MapContainer />
      </main>
    </div>
  );
}

export default App;
