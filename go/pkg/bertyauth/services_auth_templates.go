package bertyauth

import "html/template"

var templateAuthTokenServerRedirect = template.Must(template.New("redirect").Parse(`<!DOCTYPE html>
<html lang="en-GB">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirect</title>
    <script>
      location.href = "{{.URL}}";
    </script>
  </head>
  <body>
    <div
      style="display: flex; align-items: center; justify-content: center; height: 100vh"
    >
      <a
        style="text-decoration: none; font-family: Verdana, Geneva, sans-serif; font-weight: 600; color: white; border-radius: 10px; background-color: #404148; padding: 10px 17px; display: flex; align-items: center; justify-content: center;"
        href="{{.URL}}"
      >
        REDIRECT
      </a>
    </div>
  </body>
</html>
`))

// nolint:gosec
var templateAuthTokenServerAuthorizeButton = `<!DOCTYPE html>
<html lang="en-GB">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CONNECT & REPLICATE</title>
    <style>
      body {
        margin: 0;
        background-color: #3f49ea;
        font-family: Arial, Helvetica, sans-serif;
      }
      main {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      p {
        color: #898ba3;
      }
      .title {
        color: #3f49ea;
      }
      .block {
        width: 300px;
        max-width: 100%;
        text-align: center;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(171, 174, 209, 0.3);
        font-weight: 400;
        display: block;
        position: relative;
        padding: 25px;
      }
      .badge-wrapper {
        text-align: right;
      }
      .badge {
        color: #20d6b5;
        background-color: #d3f8f2;
        display: initial;
        padding: 5px 12px;
        border-radius: 20px;
      }
      .btn {
        margin-top: 20px;
        font-weight: 600;
        color: #3f49ea;
        background-color: #e2e4fc;
        border-radius: 9px;
        padding: 9px 18px;
        cursor: pointer;
        text-align: center;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: none;
        outline: none;
        font-size: 1rem;
        line-height: 1.5;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
          border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
      .btn:hover {
        color: #fff;
        background-color: #3f49ea;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="block">
        <div class="badge-wrapper">
          <div class="badge">Performance</div>
        </div>
        <h2 class="title">Berty Replication Service</h2>
        <p>
          This will automatically replicate your conversations on our server, to
          provide your device the most efficient network performance.
        </p>
        <p>This feature is optional.</p>
        <form method="POST">
          <button class="btn" type="submit">CONNECT & REPLICATE</button>
        </form>
      </div>
    </main>
  </body>
</html>
`
