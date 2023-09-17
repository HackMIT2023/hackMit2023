import React, { Component } from 'react';

const initSqlJs = window.initSqlJs;

const SQL = await initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
});

class MapContainer extends Component {
  static db = MapContainer.setupDatabase();

  static mapRef = React.createRef();
  static returnZoom = 14;
  static mapState = "wandering"; // "wandering", "creating", "focused", "joined"
  static focusedGarden = null;
  static creatingPolygon = null;
  static homeCoords = {
    lat: 42.35942459106445,
    lng: -71.09184265136719
  }
  static gardens = MapContainer.loadGardensFromDatabase();
  static map;

  static numbers = [1, 2, 3, 4, 5];

  componentDidMount() {
    // Load the Google Maps JavaScript API script
    const mapsScript = document.createElement('script');
    mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC58rBACS0CiKVwRLVsg3tF4PmAbKjnL7I&callback=initMap`;
    mapsScript.defer = true;
    mapsScript.async = true;
    window.initMap = this.initMap;
    document.head.appendChild(mapsScript);

    document.getElementById("join-button").style.display = 'none';
    document.getElementById("confirm-button").style.display = 'none';
    document.getElementById("back-button").style.display = 'none';
    document.getElementById("create-button").style.display = null;
    document.getElementById("more-info-label").style.display = null;
    document.getElementById("garden-name").style.display = 'none';
    document.getElementById("member-count").style.display = 'none';
    document.getElementById("plants-list").style.display = 'none';
    document.getElementById("new-garden-textbox").style.display = 'none';
    document.getElementById("plants-table").style.display = 'none';
  }

  initMap = () => {
    var myStyles =[
      {
          featureType: "poi",
          elementType: "labels",
          stylers: [
              { visibility: "off" }
          ]
      }
    ];

    // Initialize the map
    MapContainer.map = new window.google.maps.Map(MapContainer.mapRef.current, {
      zoom: MapContainer.returnZoom,
      center: MapContainer.homeCoords,
      fullscreenControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeId: "terrain",
      clickableIcons: false,
      isFractionalZoomEnabled: true,
      mapTypeControl: false,
      styles: myStyles
    });

    for (var gardenId in MapContainer.gardens) {
      MapContainer.addGardenToMap(gardenId);
    }
  };

  static addGardenToMap(gardenId) {
    // Construct the polygon.
    const newPolygon = new window.google.maps.Polygon({  
        paths: MapContainer.gardens[gardenId].poly,
        strokeColor: "#00AA00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.35
    });

    newPolygon.setMap(MapContainer.map);

    newPolygon.addListener('click', function (event) {
      MapContainer.focusCallback(gardenId);
    });  
  }

  static newGardenCallback() {
    MapContainer.numbers.push(6);
    if (MapContainer.mapState === "wandering") {
      MapContainer.mapState = "creating";

        var mapCenter = MapContainer.map.getCenter()

        var mapNorthEast = MapContainer.LatLngToLatLngLiteral(MapContainer.map.getBounds().getNorthEast())
        var mapSouthWest = MapContainer.LatLngToLatLngLiteral(MapContainer.map.getBounds().getSouthWest())
        var viewportHeight = mapNorthEast.lat - mapSouthWest.lat;
        var viewportWidth = mapSouthWest.lng - mapNorthEast.lng;
        var defaultWidth = viewportWidth * 1/3;
        var defaultHeight = viewportHeight * 1/3;

        const poly = [
            {lat: mapCenter.lat() - defaultHeight/2, lng: mapCenter.lng() + defaultWidth/2},
            {lat: mapCenter.lat() + defaultHeight/2, lng: mapCenter.lng() + defaultWidth/2},
            {lat: mapCenter.lat() + defaultHeight/2, lng: mapCenter.lng() - defaultWidth/2},
            {lat: mapCenter.lat() - defaultHeight/2, lng: mapCenter.lng() - defaultWidth/2}
        ]
        MapContainer.creatingPolygon = new window.google.maps.Polygon({
            paths: poly,
            strokeColor: "#AA0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            editable: true,
            draggable: true,
        });
        MapContainer.creatingPolygon.setMap(MapContainer.map);
        
        document.getElementById("join-button").style.display = 'none';
        document.getElementById("confirm-button").style.display = null;
        document.getElementById("back-button").style.display = null;
        document.getElementById("create-button").style.display = 'none';
        document.getElementById("more-info-label").style.display = 'none';
        document.getElementById("new-garden-textbox").style.display = null;
        document.getElementById("new-garden-textbox").value = "";
    }
  }

  static focusCallback(gardenId) {
    if (MapContainer.mapState === "wandering") {
      MapContainer.returnZoom = MapContainer.map.getZoom();

        MapContainer.centerOnGarden(gardenId);

        MapContainer.mapState = "focused";
        MapContainer.focusedGarden = gardenId;
        MapContainer.disableMovement()

        document.getElementById("join-button").style.display = null;
        document.getElementById("confirm-button").style.display = 'none';
        document.getElementById("back-button").style.display = null;
        document.getElementById("create-button").style.display = 'none';
        document.getElementById("more-info-label").style.display = 'none';
        document.getElementById("garden-name").style.display = null;
        document.getElementById("member-count").style.display = null;
        document.getElementById("plants-list").style.display = null;
        document.getElementById("garden-name").innerHTML = "Garden Name: " + MapContainer.gardens[gardenId].name;
        document.getElementById("member-count").innerHTML = "Member Count: " + Object.keys(MapContainer.getUsersListForGardenFromDatabase(gardenId)).length;
        document.getElementById("plants-list").innerHTML = "Plants: " + MapContainer.prettyPrintPlants(MapContainer.getPlantsListForGardenFromDatabase(gardenId));
    }
  }

  static joinCallback() {
    if (MapContainer.mapState === "focused") {
      MapContainer.mapState = "joined";
      document.getElementById("join-button").style.display = 'none';
      document.getElementById("confirm-button").style.display = 'none';
      document.getElementById("back-button").style.display = 'none';
      document.getElementById("create-button").style.display = 'none';
      document.getElementById("more-info-label").style.display = 'none';
      MapContainer.buildPlantsTable(MapContainer.getPlantsListForGardenFromDatabase(MapContainer.focusedGarden));
    }
  }

  static confirmCallback() {
    if (MapContainer.mapState === "creating") {
        var poly = MapContainer.LatLngArrayToLatLngLiteralArray(MapContainer.creatingPolygon.getPath().getArray());
        let uuid = crypto.randomUUID();
        MapContainer.gardens[uuid] = {
            poly: poly,
            name: document.getElementById("new-garden-textbox").value
        };

        MapContainer.focusedGarden = uuid;
        MapContainer.addGardenToMap(uuid);
        MapContainer.creatingPolygon.setMap(null);
        MapContainer.creatingPolygon = null;
        MapContainer.mapState = "joined";
        MapContainer.disableMovement();
        MapContainer.centerOnGarden(uuid);
        document.getElementById("join-button").style.display = 'none';
        document.getElementById("confirm-button").style.display = 'none';
        document.getElementById("back-button").style.display = 'none';
        document.getElementById("create-button").style.display = 'none';
        document.getElementById("more-info-label").style.display = 'none';
        document.getElementById("new-garden-textbox").style.display = 'none';
        MapContainer.buildPlantsTable({});
    }
  }

  static backToMapCallback() {
    if (MapContainer.mapState === "focused") {
      MapContainer.focusedGarden = null;
      MapContainer.mapState = "wandering";
      MapContainer.enableMovement();
      MapContainer.map.setZoom(MapContainer.returnZoom);
    } else if (MapContainer.mapState === "creating") {
      MapContainer.creatingPolygon.setMap(null);
      MapContainer.creatingPolygon = null;
      MapContainer.mapState = "wandering"; 
    }
    document.getElementById("join-button").style.display = 'none';
    document.getElementById("confirm-button").style.display = 'none';
    document.getElementById("back-button").style.display = 'none';
    document.getElementById("create-button").style.display = null;
    document.getElementById("more-info-label").style.display = null;
    document.getElementById("garden-name").style.display = 'none';
    document.getElementById("member-count").style.display = 'none';
    document.getElementById("plants-list").style.display = 'none';
    document.getElementById("new-garden-textbox").style.display = 'none';
  }

  static centerOnGarden(gardenId) {
    var polyBounds = MapContainer.getPolygonBounds(MapContainer.gardens[gardenId].poly)
    MapContainer.map.fitBounds(polyBounds);
  }

  static enableMovement() {
    this.map.setOptions({ scrollwheel: true, scaleControl: true, disableDoubleClickZoom: false, draggable: true, panControl: true});
  }

  static disableMovement() {
    this.map.setOptions({ scrollwheel: false, scaleControl: false, disableDoubleClickZoom: true, draggable: false, panControl: false});
  }

  static LatLngToLatLngLiteral(latLng) {
    return {lat:latLng.lat(),lng:latLng.lng()}
  }

  static LatLngArrayToLatLngLiteralArray(latLngArray) {
    var latLngLiteralArray = [];
    for (let i = 0; i < latLngArray.length; i++) {
        latLngLiteralArray[i] = this.LatLngToLatLngLiteral(latLngArray[i])
    }
    return latLngLiteralArray
  }

  static getPolygonBounds(poly) {
    var bounds = {
        north: -Number.MAX_VALUE,
        south: Number.MAX_VALUE,
        east: -Number.MAX_VALUE,
        west: Number.MAX_VALUE
    }
    for (let i = 0; i < poly.length; i++) {
        bounds.north = Math.max(bounds.north, poly[i].lat);
        bounds.south = Math.min(bounds.south, poly[i].lat)
        bounds.east = Math.max(bounds.east, poly[i].lng);
        bounds.west = Math.min(bounds.west, poly[i].lng);
    }
    return bounds;
  }

  static setupDatabase() {
    const db = new SQL.Database();
    db.run(`
      CREATE TABLE Gardens
      (
      GardenID TEXT PRIMARY KEY,
      GardenName TEXT NOT NULL,
      JsonPolygon TEXT NOT NULL
      );
      CREATE TABLE PlantTypes
      (
      PlantTypeID TEXT PRIMARY KEY,
      PlantName TEXT NOT NULL,
      Frequency TEXT NOT NULL,
      DaysPerWater INT NOT NULL
      );
      CREATE TABLE Users
      (
      UserID TEXT PRIMARY KEY,
      First_Name TEXT NOT NULL,
      Last_Name TEXT NOT NULL,
      Email TEXT NOT NULL,
      GardenID TEXT,
      FOREIGN KEY (GardenID) REFERENCES Gardens(GardenID)
      );
      CREATE TABLE Plants
      (
      PlantID TEXT PRIMARY KEY,
      PlantTypeID TEXT NOT NULL,
      LastWatered DATE NOT NULL,
      GardenID TEXT NOT NULL,
      FOREIGN KEY (PlantTypeID) REFERENCES PlantTypes(PlantTypeID),
      FOREIGN KEY (GardenID) REFERENCES Gardens(GardenID)
      );
      INSERT INTO Gardens(GardenID, GardenName, JsonPolygon)
      VALUES
      ('5fbda066-619c-4162-b726-06803aaaec28', 'Ward Two Mega-Garden', '[[42.373467859919344,-71.0981411879177],[42.373996090377986,-71.10118246759178],[42.378286221845265,-71.10610981218002],[42.37937469411698,-71.10108899585805],[42.37922230913481,-71.0995451959656],[42.3795575556075,-71.09653969576468],[42.37691633986703,-71.09564381493045]]'),
      ('286becd3-25ed-4ab2-b43c-3c4f9e98ce1', 'MIT Eats', '[[42.35636794461739,-71.10248961042751],[42.358942534625946,-71.09719380466794],[42.357917423449656,-71.09657572045388],[42.358012738798976,-71.09627388306671],[42.35738384930745,-71.0958954800048],[42.357400169457875,-71.0958231533146],[42.35708707191252,-71.09557452837468],[42.35636514681508,-71.09770065561199],[42.35638803886317,-71.09795583132802],[42.355127112285246,-71.10174146012223]]'),
      ('009a5c65-eda8-4fe2-9cbe-2ab78c99ed3c', 'Re-Harvard', '[[42.373945344106765,-71.11881720947589],[42.37561893605512,-71.11836794239983],[42.375870796645636,-71.11789878744274],[42.37538430525211,-71.11561169423577],[42.374754761777325,-71.11451070295736],[42.372361561114175,-71.1151741360081],[42.37335113423994,-71.11849881648975]]'),
      ('afb5cc9b-b90f-49a9-a774-64fbddb3da12', 'Coastal Crops', '[[42.384073573810674,-71.0743886900176],[42.39731338703554,-71.08977178062663],[42.39881023579028,-71.08905068839401],[42.39973351791399,-71.08674291277441],[42.39573256964798,-71.07714393666518],[42.387673969905464,-71.07237292530277],[42.38641385476023,-71.06987493162029]]'),
      ('1a6279cf-3a7e-4b49-a2cf-86460669ca14', 'Conway Plantery', '[[42.38229566889973,-71.10837096166408],[42.38346435207365,-71.10775764722992],[42.38329200550119,-71.10691100665231],[42.381960817464126,-71.10761765154386]]');
      INSERT INTO PlantTypes(PlantTypeID, PlantName, Frequency, DaysPerWater)
      VALUES
      ('bf9f28f2-f822-4c46-8920-d725b345d56b', 'Tomato', 'Daily', 1),
      ('529b3210-5edc-4863-b7b5-e1532e899625', 'Cucumber', 'Daily', 1),
      ('58516dd4-912f-4fcf-823f-f89fb5d9d102', 'Carrot', 'Daily', 1),
      ('51aa5ae2-6ede-4fb0-98c0-d7f665369295', 'Potato', 'Daily', 1),
      ('a338343b-1a66-4d7e-9cf5-c10e2edc3b24', 'Corn', 'Weekly', 7),
      ('cf92eb04-e5ed-49a3-9592-3e5fdbaa74f1', 'Lettuce', 'Weekly', 7),
      ('b82c0070-9473-4069-83b8-0d2533b8f5ec', 'Pepper', 'Weekly', 7),
      ('f79a1852-b5c3-4951-bfd0-81057a6e5aec', 'Onion', 'Weekly', 7),
      ('13c96178-7a5e-4dbe-9337-48fa9d79c440', 'Radish', 'BiWeekly', 14),
      ('a2e3b21b-e9e0-4888-b52f-af91515484e9', 'Pumpkin', 'BiWeekly', 14),
      ('8bf482cb-dd1e-4d89-b47d-8c8fa807e1e4', 'Eggplant', 'BiWeekly', 14),
      ('712eeadf-9169-4351-ac7b-b3761c8ef4ac', 'Broccoli', 'BiWeekly', 14);
      INSERT INTO Users(UserID, First_Name, Last_Name, Email, GardenID)
      VALUES
      ('d2eb7978-72fd-42ff-bc60-45deb05eb911', 'John', 'Smith', 'johnsmith@school.edu', '1a6279cf-3a7e-4b49-a2cf-86460669ca14'),
      ('ef73bd3b-89a3-41ad-9944-71496f4f2d26', 'Jane', 'Doe', 'jane@school.edu', '009a5c65-eda8-4fe2-9cbe-2ab78c99ed3c'),
      ('c7db5fdf-1098-49a8-9a94-26941c073087', 'Bob', 'Smith', 'bob@school.edu', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('1411bd62-c756-45c1-9393-0edec98d9262', 'Sally', 'Smith', 'sally@school.edu', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('11e314c0-8c1a-474e-b2ab-2123ec1b262a', 'Joe', 'Smith', 'joe@school.edu', 'afb5cc9b-b90f-49a9-a774-64fbddb3da12');
      INSERT INTO Plants(PlantID, PlantTypeID, LastWatered, GardenID)
      VALUES
      ('f92b42cf-a27b-4ad5-ba17-fc14b420844b', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-16', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('6403dad8-3dd2-4f4c-bbb5-9d19a0ef86e5', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('e8b70145-a93e-4217-99f5-59af18c0d252', '712eeadf-9169-4351-ac7b-b3761c8ef4ac', '2023-09-16', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('32b87363-5372-4a49-b8d5-19df03944b9b', '529b3210-5edc-4863-b7b5-e1532e899625', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('ae917e39-a761-4a43-b1e4-c36adbd4d9b7', '529b3210-5edc-4863-b7b5-e1532e899625', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('2cf1725a-0641-4fa2-b142-ff2b99742ae7', '58516dd4-912f-4fcf-823f-f89fb5d9d102', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('d08fda19-260e-4f8d-8a00-4ca997688c20', 'f79a1852-b5c3-4951-bfd0-81057a6e5aec', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('9efac29e-ee13-48a1-9b3d-efb0a6ceec4f', '13c96178-7a5e-4dbe-9337-48fa9d79c440', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('53bb3408-5a8c-4eb6-ae0c-5d12533ac861', '51aa5ae2-6ede-4fb0-98c0-d7f665369295', '2023-09-15', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('0bb19fc9-7661-406a-98d6-ac7f10019ad0', '8bf482cb-dd1e-4d89-b47d-8c8fa807e1e4', '2023-09-14', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('8575dba6-37ba-4a1d-9b88-2ad72655be89', '51aa5ae2-6ede-4fb0-98c0-d7f665369295', '2023-09-14', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('daec35c8-2d01-48ce-91e4-3d09bcf70c18', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-13', '5fbda066-619c-4162-b726-06803aaaec28'),
      ('35d0c844-0054-4a66-96f8-cb249232a282', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-16', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('c0a6c71a-1755-43c5-8b91-7d4013c6ff39', 'b82c0070-9473-4069-83b8-0d2533b8f5ec', '2023-09-15', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('4e7c19dc-b70c-4593-8fa4-152d21e89be8', 'cf92eb04-e5ed-49a3-9592-3e5fdbaa74f1', '2023-09-16', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('a7627c30-e975-43f3-ad4a-96462deb90cf', '529b3210-5edc-4863-b7b5-e1532e899625', '2023-09-15', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('7cb491cc-e22c-4d86-a37d-8cec77568cfb', 'a338343b-1a66-4d7e-9cf5-c10e2edc3b24', '2023-09-15', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('3d606eb0-b89f-4536-818c-87fac3ee961e', '58516dd4-912f-4fcf-823f-f89fb5d9d102', '2023-09-15', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('5ded9ae0-7196-4534-b89f-a092bc655574', '51aa5ae2-6ede-4fb0-98c0-d7f665369295', '2023-09-15', '286becd3-25ed-4ab2-b43c-3c4f9e98ce1'),
      ('db731d2b-d953-49d4-96b6-c725bac70ddc', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-16', '009a5c65-eda8-4fe2-9cbe-2ab78c99ed3c'),
      ('286becd3-25ed-4ab2-b43c-3c4f9e98ce16', '8bf482cb-dd1e-4d89-b47d-8c8fa807e1e4', '2023-09-15', '009a5c65-eda8-4fe2-9cbe-2ab78c99ed3c'),
      ('afb5cc9b-b90f-49a9-a774-64fbddb3da12', '712eeadf-9169-4351-ac7b-b3761c8ef4ac', '2023-09-16', '009a5c65-eda8-4fe2-9cbe-2ab78c99ed3c'),
      ('dc6096a3-813e-4fc6-b4c7-34f172a349f0', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-16', 'afb5cc9b-b90f-49a9-a774-64fbddb3da12'),
      ('2b86cfb6-c1e4-4278-bbb4-f0d2a5d53f67', 'bf9f28f2-f822-4c46-8920-d725b345d56b', '2023-09-15', 'afb5cc9b-b90f-49a9-a774-64fbddb3da12'),
      ('b4a6ab9c-cb6c-4146-bcbc-e790c2e81074', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-10', '1a6279cf-3a7e-4b49-a2cf-86460669ca14'),
      ('5ca98612-5a7c-4aef-a4cc-f4fc170c51e5', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-11', '1a6279cf-3a7e-4b49-a2cf-86460669ca14'),
      ('8f71004a-659e-4a88-a33a-83ed9e9f26cb', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-9', '1a6279cf-3a7e-4b49-a2cf-86460669ca14'),
      ('324942ed-2e2e-443d-8142-62967b9db254', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-8', '1a6279cf-3a7e-4b49-a2cf-86460669ca14'),
      ('10ba4dc5-2134-4b6b-a384-f644f3088f6d', 'a2e3b21b-e9e0-4888-b52f-af91515484e9', '2023-09-9', '1a6279cf-3a7e-4b49-a2cf-86460669ca14');
    `);


    // // Run a query without reading the results
    // db.run("CREATE TABLE test (col1, col2);");
    // // Insert two rows: (1,111) and (2,222)
    // db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);

    // // Prepare a statement
    // const stmt = db.prepare("SELECT * FROM PlantType WHERE PlantTypeID = $id");
    // stmt.getAsObject({$id:1});

    // // Bind new values
    // stmt.bind({$id:1});
    // while(stmt.step()) { //
    //   const row = stmt.getAsObject();
    //   console.log('Here is a row: ' + JSON.stringify(row));
    // }


    return db;
  }

  static loadGardensFromDatabase() {
    var gardens = {};
    const stmt = MapContainer.db.prepare("SELECT * FROM Gardens");
    stmt.getAsObject({});
    stmt.bind({});
    while(stmt.step()) {
      const row = stmt.getAsObject();
      const gardenName = row["GardenName"];
      const polygon = MapContainer.CoordJsonToLatLngLiteralArray(row["JsonPolygon"]);
      const id = row["GardenID"];
      gardens[id] = {
        poly: polygon,
        name: gardenName
      }
    }
    return gardens;
  }

  static loadPlantTypesFromDatabase() {
    var plantTypes = {};
    const stmt = MapContainer.db.prepare("SELECT * FROM PlantTypes");
    stmt.getAsObject({});
    stmt.bind({});
    while(stmt.step()) {
      const row = stmt.getAsObject();
      plantTypes[row["PlantTypeID"]] = {
        name: row["PlantName"],
        frequency: row["Frequency"],
        daysPerWater: row["DaysPerWater"]
      }
    }
    return plantTypes;
  }

  static getUsersListForGardenFromDatabase(gardenId) {
    var users = {};
    const stmt = MapContainer.db.prepare("SELECT * FROM Users WHERE GardenID = $id");
    stmt.getAsObject({$id:gardenId});
    stmt.bind({$id:gardenId});
    while(stmt.step()) {
      const row = stmt.getAsObject();
      users[row["UserID"]] = {
        firstName: row["First_Name"],
        lastName: row["Last_Name"],
        email: row["Email"],
      }
    }
    
    return users;
  }

  static getPlantsListForGardenFromDatabase(gardenId) {
    var plants = {};
    const stmt = MapContainer.db.prepare("SELECT * FROM Plants WHERE GardenID = $id");
    stmt.getAsObject({$id:gardenId});
    stmt.bind({$id:gardenId});
    while(stmt.step()) {
      const row = stmt.getAsObject();
      plants[row["PlantID"]] = {
        plantTypeId: row["PlantTypeID"],
        lastWatered: row["LastWatered"]
      }
    }
    return plants;
  }

  static getPlantTypeFromDatabase(plantTypeId) {
    const stmt = MapContainer.db.prepare("SELECT * FROM PlantTypes WHERE PlantTypeID = $id");
    stmt.getAsObject({$id:plantTypeId});
    stmt.bind({$id:plantTypeId});
    while (stmt.step()) {
      const row = stmt.getAsObject();
      return {
        name: row["PlantName"],
        frequency: row["Frequency"],
        daysPerWater: row["DaysPerWater"]
      }
    }
    return null;
  }

  static addPlantToDatabase(plantTypeId, gardenId) {
    var dt = new Date();

    let sqlstr = `INSERT INTO Plants(PlantID, PlantTypeID, LastWatered, GardenID)
    VALUES
    ('${crypto.randomUUID()}', '${plantTypeId}', '${dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate()}', '${gardenId}')`;
    console.log(sqlstr);
    MapContainer.db.run(sqlstr);
    MapContainer.buildPlantsTable();
  }

  static prettyPrintPlants(plants) {
    var retString = "";
    var plantNames = [];
    for (var plantId in plants) {
      plantNames.push(MapContainer.getPlantTypeFromDatabase(plants[plantId]["plantTypeId"])["name"]);
    }
    plantNames = [...new Set(plantNames)];
    plantNames.sort();
    for (let i = 0; i < plantNames.length; i++) {
      retString += plantNames[i];
      if (i !== plantNames.length - 1) {
        retString += ", ";
      }
    }
    return retString;
  }

  static buildPlantsTable(plants) {
    document.getElementById("plants-table").innerHTML = `<tr><th>Plant</th><th>Frequency</th><th>Watered</th></tr>`;
    for (var plantId in plants) {
      var plantType = MapContainer.getPlantTypeFromDatabase(plants[plantId]["plantTypeId"]);
      document.getElementById("plants-table").innerHTML += `<tr><td>${plantType["name"]}</td><td>${plantType["frequency"]}</td><td><input type="checkbox" id="plant-table.${plantId}"/></td></tr>`
      
    }

    window.addNewPlant = () => {
      MapContainer.addPlantToDatabase(document.getElementById("new-plant-select").value,this.focusedGarden);
      MapContainer.buildPlantsTable();
    }

    document.getElementById("plants-table").innerHTML += `<tr><td><select id="new-plant-select"></select></td><td><button onClick=addNewPlant()>Add</button></td><td>N/A</td></tr>`

    var plantTypes = MapContainer.loadPlantTypesFromDatabase();
    for (var plantTypeId in plantTypes) {
      document.getElementById("new-plant-select").innerHTML += `<option value="${plantTypeId}">${plantTypes[plantTypeId]["name"]}</option>`
    }

    for (var plantId in plants) {
      var plantType = MapContainer.getPlantTypeFromDatabase(plants[plantId]["plantTypeId"]);
      var lastWatered = Date.parse(plants[plantId]["lastWatered"]);
      var nextWatering = lastWatered + (plantType["daysPerWater"] * 86400000);
      var needsWatering = (Date.now() - lastWatered) < (plantType["daysPerWater"] * 86400000);
      if (!needsWatering) {
        document.getElementById("plant-table." + plantId).checked = true;
        document.getElementById("plant-table." + plantId).disabled = "disabled";
      }
    }

    document.getElementById("plants-table").style.display = null;

    // const tableItems = MapContainer.numbers.map((number) =>
    //   <tr><td><input type="checkbox" /></td><td>{number}</td></tr>
    // );
  }

  static CoordJsonToLatLngLiteralArray(jsonString) {
    const json = JSON.parse(jsonString);
    var latLngLiteralArray = [];
    for (let i = 0; i < json.length; i++) {
      latLngLiteralArray[i] = {lat:json[i][0],lng:json[i][1]};
    }
    return latLngLiteralArray;
  }

  render() {
    return <div ref={MapContainer.mapRef} id="Map-Container" />;
  }

}

export default MapContainer;
