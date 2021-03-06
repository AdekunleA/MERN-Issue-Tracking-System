export default function template(body) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8/>
  <title>Pro MERN Stack</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../src/css/bootstrap.min.css">
  <style>
    .panel-title a {display: block; width: 100%; cursor: pointer; }
  </style>
</head>
<body>
  <div id="contents">${body}</div>
  <!-- this is where our component will appear -->
  <script src="../static/vendor.bundle.js"></script>
  <script src="../static/app.bundle.js"></script>
</body>
</html>`;  
}