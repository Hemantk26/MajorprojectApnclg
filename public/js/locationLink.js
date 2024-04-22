    function fetchLocation() {
      var googleMapsLinkInput = document.getElementById('googleMapsLink');

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          var googleMapsLink = "https://www.google.com/maps?q=" + latitude + "," + longitude;
          googleMapsLinkInput.value = googleMapsLink;
        }, function (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              alert("An unknown error occurred.");
              break;
          }
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }