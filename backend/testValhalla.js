const axios = require("axios");

async function testRoutes() {
  const locations = [
    { lat: 19.054999, lon: 72.8692035 },
    { lat: 18.5213738, lon: 73.8545071 }
  ];

  const tests = [
    {
      name: "Default",
      options: {}
    },
    {
      name: "Avoid highways and tolls",
      options: {
        use_highways: 0,
        use_tolls: 0,
        use_living_streets: 0,
        use_tracks: 0
      }
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.post(
        "https://valhalla1.openstreetmap.de/route",
        {
          locations,
          costing: "auto",
          costing_options: {
            auto: test.options
          },
          units: "kilometers"
        }
      );

      const summary = response.data.trip.summary;

      console.log("\n" + test.name);
      console.log("Distance:", summary.length, "km");
      console.log("Travel time:", (summary.time / 60).toFixed(1), "minutes");
      console.log("Has highway:", summary.has_highway);
      console.log("Has toll:", summary.has_toll);
    } catch (error) {
      console.log("\n" + test.name + " failed:");
      console.log(error.response?.data || error.message);
    }
  }
}

testRoutes();