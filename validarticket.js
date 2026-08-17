import { supabase } from "./supabase.js";


export function Scanner(app) {

  app.innerHTML = `

    <div class="scanner-view">

      <div id="reader"></div>

      <div
        id="result"
        class="result"
      >
        Apuntá la cámara al código QR
      </div>

    </div>

  `;


  const result =
    document.getElementById(
      "result"
    );


  const scanner =
    new Html5Qrcode(
      "reader"
    );


  let procesando =
    false;



  /*
   * ==========================================================
   * OBTENER ID DEL EVENTO DESDE LA URL
   * ==========================================================
   *
   * Formato esperado:
   *
   * #/scanner/ID_DEL_EVENTO
   *
   */


  const hash =
    window.location.hash;


  const partes =
    hash
      .replace(/^#\/?/, "")
      .split("/");


  /*
   * partes[0] = scanner
   * partes[1] = id del evento
   */


  if (
    partes[0] !== "scanner" ||
    !partes[1]
  ) {

    result.textContent =
      "❌ No se encontró el ID del evento.";

    return;

  }


  const eventId =
    partes[1];


  console.log(
    "Scanner iniciado para evento:",
    eventId
  );



  /*
   * ==========================================================
   * PROCESAR QR
   * ==========================================================
   */


  async function procesarQR(
    qrToken
  ) {

    if (procesando) {

      return;

    }


    procesando =
      true;


    try {


      /*
       * ======================================================
       * BUSCAR TICKET
       * ======================================================
       */

      const {
        data,
        error
      } =
        await supabase
          .from("Tickets")
          .select("*")
          .eq(
            "qr_token",
            qrToken
          )
          .maybeSingle();



      /*
       * TICKET NO EXISTE
       */

      if (error) {

        console.error(
          "Error buscando ticket:",
          error
        );

        result.textContent =
          "❌ Error al verificar el ticket.";

        return;

      }


      if (!data) {

        result.textContent =
          "❌ QR inválido.";

        return;

      }



      /*
       * ======================================================
       * COMPROBAR EVENTO
       * ======================================================
       *
       * El ticket solamente puede utilizarse
       * desde el scanner correspondiente
       * al mismo evento.
       */


      if (
        data["event-id"] !==
        eventId
      ) {

        result.textContent =
          "❌ Este ticket pertenece a otro evento.";

        return;

      }



      /*
       * ======================================================
       * COMPROBAR ESTADO
       * ======================================================
       */


      if (
        data.Estado !==
        "usable"
      ) {

        result.textContent =
          "❌ Ticket ya utilizado.";

        return;

      }



      /*
       * ======================================================
       * ACTUALIZAR TICKET
       * ======================================================
       *
       * Importante:
       *
       * También comprobamos el event-id en el UPDATE.
       *
       * Así la actualización solamente puede afectar
       * al ticket de este evento.
       */


      const {
        error: updateError
      } =
        await supabase
          .from("Tickets")
          .update({
            Estado:
              "used"
          })
          .eq(
            "qr_token",
            qrToken
          )
          .eq(
            "event-id",
            eventId
          );



      /*
       * ERROR ACTUALIZANDO
       */

      if (updateError) {

        console.error(
          "Error actualizando ticket:",
          updateError
        );

        result.textContent =
          "❌ Error al actualizar el ticket.";

        return;

      }



      /*
       * ACCESO PERMITIDO
       */

      result.textContent =
        "✅ Acceso permitido.";


    } catch (err) {

      console.error(
        err
      );

      result.textContent =
        "❌ Error inesperado.";

    }



    /*
     * ========================================================
     * PREPARAR SIGUIENTE ESCANEO
     * ========================================================
     */

    setTimeout(
      () => {

        result.textContent =
          "Apuntá la cámara al código QR";

        procesando =
          false;

      },
      2000
    );

  }



  /*
   * ==========================================================
   * INICIAR CÁMARA
   * ==========================================================
   */


  Html5Qrcode
    .getCameras()
    .then(
      (devices) => {


        if (
          !devices.length
        ) {

          result.textContent =
            "No se encontró ninguna cámara.";

          return;

        }


        scanner.start(

          {
            facingMode:
              "environment"
          },

          {
            fps:
              10
          },

          (decodedText) => {

            procesarQR(
              decodedText
            );

          },

          () => {}

        );

      }
    )
    .catch(
      (err) => {

        console.error(
          err
        );

        result.textContent =
          "No se pudo acceder a la cámara.";

      }
    );

}
