const app =
  document.getElementById("app");


app.innerHTML = `

  <div
    id="reader"
    style="
      width: 100vw;
      height: 100vh;
      background: black;
    "
  ></div>

`;


const scanner =
  new Html5Qrcode(
    "reader"
  );


console.log(
  "Iniciando cámara..."
);


scanner
  .start(

    {
      facingMode:
        "environment"
    },

    {
      fps: 10
    },

    (decodedText) => {

      console.log(
        "QR DETECTADO:",
        decodedText
      );

    },

    () => {

      // Error normal cuando
      // todavía no encuentra un QR.

    }

  )

  .then(() => {

    console.log(
      "CÁMARA INICIADA CORRECTAMENTE"
    );

  })

  .catch((error) => {

    console.error(
      "ERROR INICIANDO CÁMARA:",
      error
    );

  });