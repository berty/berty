export const HelloWorldHtml = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Page Title</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
body {
  background-color: blue;
}

h1 {
  color: red;
}
</style>
    </head>
    <body>
        <h1>Hello world</h1>
        <button>coucou</button>
    </body>
</html>`

export const PuzzleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>2048</title>

  <style>@import url(fonts/clear-sans.css);
html, body {
  margin: 0;
  padding: 0;
  background: #faf8ef;
  color: #776e65;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  font-size: 18px; }

body {
  margin: 80px 0; }

.heading:after {
  content: "";
  display: block;
  clear: both; }

h1.title {
  font-size: 80px;
  font-weight: bold;
  margin: 0;
  display: block;
  float: left; }

@-webkit-keyframes move-up {
  0% {
    top: 25px;
    opacity: 1; }

  100% {
    top: -50px;
    opacity: 0; } }
@-moz-keyframes move-up {
  0% {
    top: 25px;
    opacity: 1; }

  100% {
    top: -50px;
    opacity: 0; } }
@keyframes move-up {
  0% {
    top: 25px;
    opacity: 1; }

  100% {
    top: -50px;
    opacity: 0; } }
.scores-container {
  float: right;
  text-align: right; }

.score-container, .best-container {
  position: relative;
  display: inline-block;
  background: #bbada0;
  padding: 15px 25px;
  font-size: 25px;
  height: 25px;
  line-height: 47px;
  font-weight: bold;
  border-radius: 3px;
  color: white;
  margin-top: 8px;
  text-align: center; }
  .score-container:after, .best-container:after {
    position: absolute;
    width: 100%;
    top: 10px;
    left: 0;
    text-transform: uppercase;
    font-size: 13px;
    line-height: 13px;
    text-align: center;
    color: #eee4da; }
  .score-container .score-addition, .best-container .score-addition {
    position: absolute;
    right: 30px;
    color: red;
    font-size: 25px;
    line-height: 25px;
    font-weight: bold;
    color: rgba(119, 110, 101, 0.9);
    z-index: 100;
    -webkit-animation: move-up 600ms ease-in;
    -moz-animation: move-up 600ms ease-in;
    animation: move-up 600ms ease-in;
    -webkit-animation-fill-mode: both;
    -moz-animation-fill-mode: both;
    animation-fill-mode: both; }

.score-container:after {
  content: "Score"; }

.best-container:after {
  content: "Best"; }

p {
  margin-top: 0;
  margin-bottom: 10px;
  line-height: 1.65; }

a {
  color: #776e65;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer; }

strong.important {
  text-transform: uppercase; }

hr {
  border: none;
  border-bottom: 1px solid #d8d4d0;
  margin-top: 20px;
  margin-bottom: 30px; }

.container {
  width: 500px;
  margin: 0 auto; }

@-webkit-keyframes fade-in {
  0% {
    opacity: 0; }

  100% {
    opacity: 1; } }
@-moz-keyframes fade-in {
  0% {
    opacity: 0; }

  100% {
    opacity: 1; } }
@keyframes fade-in {
  0% {
    opacity: 0; }

  100% {
    opacity: 1; } }
.game-container {
  margin-top: 40px;
  position: relative;
  padding: 15px;
  cursor: default;
  -webkit-touch-callout: none;
  -ms-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -ms-touch-action: none;
  touch-action: none;
  background: #bbada0;
  border-radius: 6px;
  width: 500px;
  height: 500px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box; }
  .game-container .game-message {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(238, 228, 218, 0.5);
    z-index: 100;
    text-align: center;
    -webkit-animation: fade-in 800ms ease 1200ms;
    -moz-animation: fade-in 800ms ease 1200ms;
    animation: fade-in 800ms ease 1200ms;
    -webkit-animation-fill-mode: both;
    -moz-animation-fill-mode: both;
    animation-fill-mode: both; }
    .game-container .game-message p {
      font-size: 60px;
      font-weight: bold;
      height: 60px;
      line-height: 60px;
      margin-top: 222px; }
    .game-container .game-message .lower {
      display: block;
      margin-top: 59px; }
    .game-container .game-message a {
      display: inline-block;
      background: #8f7a66;
      border-radius: 3px;
      padding: 0 20px;
      text-decoration: none;
      color: #f9f6f2;
      height: 40px;
      line-height: 42px;
      margin-left: 9px; }
      .game-container .game-message a.keep-playing-button {
        display: none; }
    .game-container .game-message.game-won {
      background: rgba(237, 194, 46, 0.5);
      color: #f9f6f2; }
      .game-container .game-message.game-won a.keep-playing-button {
        display: inline-block; }
    .game-container .game-message.game-won, .game-container .game-message.game-over {
      display: block; }

.grid-container {
  position: absolute;
  z-index: 1; }

.grid-row {
  margin-bottom: 15px; }
  .grid-row:last-child {
    margin-bottom: 0; }
  .grid-row:after {
    content: "";
    display: block;
    clear: both; }

.grid-cell {
  width: 106.25px;
  height: 106.25px;
  margin-right: 15px;
  float: left;
  border-radius: 3px;
  background: rgba(238, 228, 218, 0.35); }
  .grid-cell:last-child {
    margin-right: 0; }

.tile-container {
  position: absolute;
  z-index: 2; }

.tile, .tile .tile-inner {
  width: 107px;
  height: 107px;
  line-height: 107px; }
.tile.tile-position-1-1 {
  -webkit-transform: translate(0px, 0px);
  -moz-transform: translate(0px, 0px);
  -ms-transform: translate(0px, 0px);
  transform: translate(0px, 0px); }
.tile.tile-position-1-2 {
  -webkit-transform: translate(0px, 121px);
  -moz-transform: translate(0px, 121px);
  -ms-transform: translate(0px, 121px);
  transform: translate(0px, 121px); }
.tile.tile-position-1-3 {
  -webkit-transform: translate(0px, 242px);
  -moz-transform: translate(0px, 242px);
  -ms-transform: translate(0px, 242px);
  transform: translate(0px, 242px); }
.tile.tile-position-1-4 {
  -webkit-transform: translate(0px, 363px);
  -moz-transform: translate(0px, 363px);
  -ms-transform: translate(0px, 363px);
  transform: translate(0px, 363px); }
.tile.tile-position-2-1 {
  -webkit-transform: translate(121px, 0px);
  -moz-transform: translate(121px, 0px);
  -ms-transform: translate(121px, 0px);
  transform: translate(121px, 0px); }
.tile.tile-position-2-2 {
  -webkit-transform: translate(121px, 121px);
  -moz-transform: translate(121px, 121px);
  -ms-transform: translate(121px, 121px);
  transform: translate(121px, 121px); }
.tile.tile-position-2-3 {
  -webkit-transform: translate(121px, 242px);
  -moz-transform: translate(121px, 242px);
  -ms-transform: translate(121px, 242px);
  transform: translate(121px, 242px); }
.tile.tile-position-2-4 {
  -webkit-transform: translate(121px, 363px);
  -moz-transform: translate(121px, 363px);
  -ms-transform: translate(121px, 363px);
  transform: translate(121px, 363px); }
.tile.tile-position-3-1 {
  -webkit-transform: translate(242px, 0px);
  -moz-transform: translate(242px, 0px);
  -ms-transform: translate(242px, 0px);
  transform: translate(242px, 0px); }
.tile.tile-position-3-2 {
  -webkit-transform: translate(242px, 121px);
  -moz-transform: translate(242px, 121px);
  -ms-transform: translate(242px, 121px);
  transform: translate(242px, 121px); }
.tile.tile-position-3-3 {
  -webkit-transform: translate(242px, 242px);
  -moz-transform: translate(242px, 242px);
  -ms-transform: translate(242px, 242px);
  transform: translate(242px, 242px); }
.tile.tile-position-3-4 {
  -webkit-transform: translate(242px, 363px);
  -moz-transform: translate(242px, 363px);
  -ms-transform: translate(242px, 363px);
  transform: translate(242px, 363px); }
.tile.tile-position-4-1 {
  -webkit-transform: translate(363px, 0px);
  -moz-transform: translate(363px, 0px);
  -ms-transform: translate(363px, 0px);
  transform: translate(363px, 0px); }
.tile.tile-position-4-2 {
  -webkit-transform: translate(363px, 121px);
  -moz-transform: translate(363px, 121px);
  -ms-transform: translate(363px, 121px);
  transform: translate(363px, 121px); }
.tile.tile-position-4-3 {
  -webkit-transform: translate(363px, 242px);
  -moz-transform: translate(363px, 242px);
  -ms-transform: translate(363px, 242px);
  transform: translate(363px, 242px); }
.tile.tile-position-4-4 {
  -webkit-transform: translate(363px, 363px);
  -moz-transform: translate(363px, 363px);
  -ms-transform: translate(363px, 363px);
  transform: translate(363px, 363px); }

.tile {
  position: absolute;
  -webkit-transition: 100ms ease-in-out;
  -moz-transition: 100ms ease-in-out;
  transition: 100ms ease-in-out;
  -webkit-transition-property: -webkit-transform;
  -moz-transition-property: -moz-transform;
  transition-property: transform; }
  .tile .tile-inner {
    border-radius: 3px;
    background: #eee4da;
    text-align: center;
    font-weight: bold;
    z-index: 10;
    font-size: 55px; }
  .tile.tile-2 .tile-inner {
    background: #eee4da;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0), inset 0 0 0 1px rgba(255, 255, 255, 0); }
  .tile.tile-4 .tile-inner {
    background: #ede0c8;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0), inset 0 0 0 1px rgba(255, 255, 255, 0); }
  .tile.tile-8 .tile-inner {
    color: #f9f6f2;
    background: #f2b179; }
  .tile.tile-16 .tile-inner {
    color: #f9f6f2;
    background: #f59563; }
  .tile.tile-32 .tile-inner {
    color: #f9f6f2;
    background: #f67c5f; }
  .tile.tile-64 .tile-inner {
    color: #f9f6f2;
    background: #f65e3b; }
  .tile.tile-128 .tile-inner {
    color: #f9f6f2;
    background: #edcf72;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.2381), inset 0 0 0 1px rgba(255, 255, 255, 0.14286);
    font-size: 45px; }
    @media screen and (max-width: 520px) {
      .tile.tile-128 .tile-inner {
        font-size: 25px; } }
  .tile.tile-256 .tile-inner {
    color: #f9f6f2;
    background: #edcc61;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.31746), inset 0 0 0 1px rgba(255, 255, 255, 0.19048);
    font-size: 45px; }
    @media screen and (max-width: 520px) {
      .tile.tile-256 .tile-inner {
        font-size: 25px; } }
  .tile.tile-512 .tile-inner {
    color: #f9f6f2;
    background: #edc850;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.39683), inset 0 0 0 1px rgba(255, 255, 255, 0.2381);
    font-size: 45px; }
    @media screen and (max-width: 520px) {
      .tile.tile-512 .tile-inner {
        font-size: 25px; } }
  .tile.tile-1024 .tile-inner {
    color: #f9f6f2;
    background: #edc53f;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.47619), inset 0 0 0 1px rgba(255, 255, 255, 0.28571);
    font-size: 35px; }
    @media screen and (max-width: 520px) {
      .tile.tile-1024 .tile-inner {
        font-size: 15px; } }
  .tile.tile-2048 .tile-inner {
    color: #f9f6f2;
    background: #edc22e;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.55556), inset 0 0 0 1px rgba(255, 255, 255, 0.33333);
    font-size: 35px; }
    @media screen and (max-width: 520px) {
      .tile.tile-2048 .tile-inner {
        font-size: 15px; } }
  .tile.tile-super .tile-inner {
    color: #f9f6f2;
    background: #3c3a32;
    font-size: 30px; }
    @media screen and (max-width: 520px) {
      .tile.tile-super .tile-inner {
        font-size: 10px; } }

@-webkit-keyframes appear {
  0% {
    opacity: 0;
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  100% {
    opacity: 1;
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
@-moz-keyframes appear {
  0% {
    opacity: 0;
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  100% {
    opacity: 1;
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
@keyframes appear {
  0% {
    opacity: 0;
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  100% {
    opacity: 1;
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
.tile-new .tile-inner {
  -webkit-animation: appear 200ms ease 100ms;
  -moz-animation: appear 200ms ease 100ms;
  animation: appear 200ms ease 100ms;
  -webkit-animation-fill-mode: backwards;
  -moz-animation-fill-mode: backwards;
  animation-fill-mode: backwards; }

@-webkit-keyframes pop {
  0% {
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  50% {
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    -ms-transform: scale(1.2);
    transform: scale(1.2); }

  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
@-moz-keyframes pop {
  0% {
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  50% {
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    -ms-transform: scale(1.2);
    transform: scale(1.2); }

  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
@keyframes pop {
  0% {
    -webkit-transform: scale(0);
    -moz-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0); }

  50% {
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    -ms-transform: scale(1.2);
    transform: scale(1.2); }

  100% {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1); } }
.tile-merged .tile-inner {
  z-index: 20;
  -webkit-animation: pop 200ms ease 100ms;
  -moz-animation: pop 200ms ease 100ms;
  animation: pop 200ms ease 100ms;
  -webkit-animation-fill-mode: backwards;
  -moz-animation-fill-mode: backwards;
  animation-fill-mode: backwards; }

.above-game:after {
  content: "";
  display: block;
  clear: both; }

.game-intro {
  float: left;
  line-height: 42px;
  margin-bottom: 0; }

.restart-button {
  display: inline-block;
  background: #8f7a66;
  border-radius: 3px;
  padding: 0 20px;
  text-decoration: none;
  color: #f9f6f2;
  height: 40px;
  line-height: 42px;
  display: block;
  text-align: center;
  float: right; }

.game-explanation {
  margin-top: 50px; }

@media screen and (max-width: 520px) {
  html, body {
    font-size: 15px; }

  body {
    margin: 20px 0;
    padding: 0 20px; }

  h1.title {
    font-size: 27px;
    margin-top: 15px; }

  .container {
    width: 280px;
    margin: 0 auto; }

  .score-container, .best-container {
    margin-top: 0;
    padding: 15px 10px;
    min-width: 40px; }

  .heading {
    margin-bottom: 10px; }

  .game-intro {
    width: 55%;
    display: block;
    box-sizing: border-box;
    line-height: 1.65; }

  .restart-button {
    width: 42%;
    padding: 0;
    display: block;
    box-sizing: border-box;
    margin-top: 2px; }

  .game-container {
    margin-top: 17px;
    position: relative;
    padding: 10px;
    cursor: default;
    -webkit-touch-callout: none;
    -ms-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -ms-touch-action: none;
    touch-action: none;
    background: #bbada0;
    border-radius: 6px;
    width: 280px;
    height: 280px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box; }
    .game-container .game-message {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(238, 228, 218, 0.5);
      z-index: 100;
      text-align: center;
      -webkit-animation: fade-in 800ms ease 1200ms;
      -moz-animation: fade-in 800ms ease 1200ms;
      animation: fade-in 800ms ease 1200ms;
      -webkit-animation-fill-mode: both;
      -moz-animation-fill-mode: both;
      animation-fill-mode: both; }
      .game-container .game-message p {
        font-size: 60px;
        font-weight: bold;
        height: 60px;
        line-height: 60px;
        margin-top: 222px; }
      .game-container .game-message .lower {
        display: block;
        margin-top: 59px; }
      .game-container .game-message a {
        display: inline-block;
        background: #8f7a66;
        border-radius: 3px;
        padding: 0 20px;
        text-decoration: none;
        color: #f9f6f2;
        height: 40px;
        line-height: 42px;
        margin-left: 9px; }
        .game-container .game-message a.keep-playing-button {
          display: none; }
      .game-container .game-message.game-won {
        background: rgba(237, 194, 46, 0.5);
        color: #f9f6f2; }
        .game-container .game-message.game-won a.keep-playing-button {
          display: inline-block; }
      .game-container .game-message.game-won, .game-container .game-message.game-over {
        display: block; }

  .grid-container {
    position: absolute;
    z-index: 1; }

  .grid-row {
    margin-bottom: 10px; }
    .grid-row:last-child {
      margin-bottom: 0; }
    .grid-row:after {
      content: "";
      display: block;
      clear: both; }

  .grid-cell {
    width: 57.5px;
    height: 57.5px;
    margin-right: 10px;
    float: left;
    border-radius: 3px;
    background: rgba(238, 228, 218, 0.35); }
    .grid-cell:last-child {
      margin-right: 0; }

  .tile-container {
    position: absolute;
    z-index: 2; }

  .tile, .tile .tile-inner {
    width: 58px;
    height: 58px;
    line-height: 58px; }
  .tile.tile-position-1-1 {
    -webkit-transform: translate(0px, 0px);
    -moz-transform: translate(0px, 0px);
    -ms-transform: translate(0px, 0px);
    transform: translate(0px, 0px); }
  .tile.tile-position-1-2 {
    -webkit-transform: translate(0px, 67px);
    -moz-transform: translate(0px, 67px);
    -ms-transform: translate(0px, 67px);
    transform: translate(0px, 67px); }
  .tile.tile-position-1-3 {
    -webkit-transform: translate(0px, 135px);
    -moz-transform: translate(0px, 135px);
    -ms-transform: translate(0px, 135px);
    transform: translate(0px, 135px); }
  .tile.tile-position-1-4 {
    -webkit-transform: translate(0px, 202px);
    -moz-transform: translate(0px, 202px);
    -ms-transform: translate(0px, 202px);
    transform: translate(0px, 202px); }
  .tile.tile-position-2-1 {
    -webkit-transform: translate(67px, 0px);
    -moz-transform: translate(67px, 0px);
    -ms-transform: translate(67px, 0px);
    transform: translate(67px, 0px); }
  .tile.tile-position-2-2 {
    -webkit-transform: translate(67px, 67px);
    -moz-transform: translate(67px, 67px);
    -ms-transform: translate(67px, 67px);
    transform: translate(67px, 67px); }
  .tile.tile-position-2-3 {
    -webkit-transform: translate(67px, 135px);
    -moz-transform: translate(67px, 135px);
    -ms-transform: translate(67px, 135px);
    transform: translate(67px, 135px); }
  .tile.tile-position-2-4 {
    -webkit-transform: translate(67px, 202px);
    -moz-transform: translate(67px, 202px);
    -ms-transform: translate(67px, 202px);
    transform: translate(67px, 202px); }
  .tile.tile-position-3-1 {
    -webkit-transform: translate(135px, 0px);
    -moz-transform: translate(135px, 0px);
    -ms-transform: translate(135px, 0px);
    transform: translate(135px, 0px); }
  .tile.tile-position-3-2 {
    -webkit-transform: translate(135px, 67px);
    -moz-transform: translate(135px, 67px);
    -ms-transform: translate(135px, 67px);
    transform: translate(135px, 67px); }
  .tile.tile-position-3-3 {
    -webkit-transform: translate(135px, 135px);
    -moz-transform: translate(135px, 135px);
    -ms-transform: translate(135px, 135px);
    transform: translate(135px, 135px); }
  .tile.tile-position-3-4 {
    -webkit-transform: translate(135px, 202px);
    -moz-transform: translate(135px, 202px);
    -ms-transform: translate(135px, 202px);
    transform: translate(135px, 202px); }
  .tile.tile-position-4-1 {
    -webkit-transform: translate(202px, 0px);
    -moz-transform: translate(202px, 0px);
    -ms-transform: translate(202px, 0px);
    transform: translate(202px, 0px); }
  .tile.tile-position-4-2 {
    -webkit-transform: translate(202px, 67px);
    -moz-transform: translate(202px, 67px);
    -ms-transform: translate(202px, 67px);
    transform: translate(202px, 67px); }
  .tile.tile-position-4-3 {
    -webkit-transform: translate(202px, 135px);
    -moz-transform: translate(202px, 135px);
    -ms-transform: translate(202px, 135px);
    transform: translate(202px, 135px); }
  .tile.tile-position-4-4 {
    -webkit-transform: translate(202px, 202px);
    -moz-transform: translate(202px, 202px);
    -ms-transform: translate(202px, 202px);
    transform: translate(202px, 202px); }

  .tile .tile-inner {
    font-size: 35px; }

  .game-message p {
    font-size: 30px !important;
    height: 30px !important;
    line-height: 30px !important;
    margin-top: 90px !important; }
  .game-message .lower {
    margin-top: 30px !important; } }
</style>
  <link rel="shortcut icon" href="data:image/png;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAgBAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAADE7E4AxOy+AMTs9ADE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz0AMTsvgDE7E0AAAAAAAAAAAAAAAAAxOyEAMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7IQAAAAAAMTsTQDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7E0AxOy+AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTsvgDE7PIAxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOzzAMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/Iszv/yLM7/8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/Iszv/yLM7/8RyO3/AMTs/wDE7P8AxOz/AMTs/5nn9////////////////////////////6rr+f8AxOz/Iszv/+77/v////////////////9E1PH/AMTs/wDE7P8AxOz/AMTs/wDE7P+Z5/f//////xHI7f8AxOz/RNTx//////////////////////+Z5/f/AMTs/wDE7P8AxOz/mef3/////////////////+77/v//////mef3/wDE7P/d9/z//////933/P/M8/v///////////8AxOz/iOP2/7vv+v+q6/n/quv5/+77/v//////u+/6/xHI7f/u+/7//////7vv+v+Z5/f///////////9E1PH/AMTs/wDE7P8AxOz/u+/6///////u+/7/Ecjt/wDE7P8AxOz/Ecjt////////////AMTs/wDE7P/u+/7//////0TU8f//////////////////////////////////////Ecjt/+77/v//////AMTs/wDE7P+77/r//////1XY8v8AxOz/AMTs/wDE7P8AxOz/quv5////////////Ecjt/wDE7P8RyO3//////+77/v8AxOz/AMTs/6rr+f//////Vdjy/6rr+f//////zPP7/xHI7f+77/r//////0TU8f8AxOz/3ff8//////+q6/n/Ztz0////////////Iszv/wDE7P8AxOz/AMTs/wDE7P8AxOz/zPP7///////d9/z/AMTs/xHI7f//////7vv+/wDE7P8AxOz/quv5//////9V2PL/AMTs/933/P//////M9Dw/5nn9///////Ecjt/wDE7P8RyO3//////////////////////2bc9P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz///////////8z0PD/Ecjt///////u+/7/AMTs/wDE7P+q6/n//////1XY8v8AxOz/Ecjt////////////u+/6//////8RyO3/AMTs/4jj9v//////7vv+/8zz+///////3ff8/wDE7P8AxOz/AMTs/xHI7f+q6/n/Vdjy/wDE7P/M8/v//////1XY8v8RyO3///////////8z0PD/Ecjt////////////M9Dw/wDE7P8AxOz/RNTx/////////////////xHI7f8AxOz/zPP7//////8z0PD/AMTs////////////Iszv/wDE7P8AxOz/Vdjy////////////////////////////Ecjt/wDE7P934PX//////////////////////7vv+v8AxOz/AMTs/wDE7P8AxOz/iOP2////////////Ecjt/wDE7P+I4/b///////////////////////////8AxOz/AMTs/wDE7P8AxOz/M9Dw/5nn9/+q6/n/mef3/xHI7f8AxOz/AMTs/wDE7P9E1PH/quv5/7vv+v9m3PT/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/Ztz0/3fg9f8RyO3/AMTs/wDE7P9V2PL/quv5/6rr+f934PX/Ecjt/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOzyAMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs8gDE7L4AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOy+AMTsTADE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7E0AAAAAAMTshADE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOyEAAAAAAAAAAAAAAAAAMTsTQDE7L4AxOzzAMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7P8AxOz/AMTs/wDE7PMAxOy+AMTsTAAAAAAAAAAAwAAAA4AAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAcAAAAM="><!-- iPhone 5+ -->
  <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)" href="data:image/png;base64,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TUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KOXS2agAAQABJREFUeAHsvQd4FUea710iKYAQIAkQOedgwOAMNg445xxnbM+MPcGT7u7c3Wfvfs/db/fZb3fu3p2d2RlPsD3OEeeIAzYOGEzGZAQChBJCEkICify9/xZ1VKdPd5+gc9Qn/F8/x6dDdVX1r1r0/7xV9VbW0daGU4pGAiRAAiRAAiRAAiSQMQS6ZMyd8kZJgARIgARIgARIgAQsAhSAfBBIgARIgARIgARIIMMIUABmWIPzdkmABEiABEiABEiAApDPAAmQAAmQAAmQAAlkGAEKwAxrcN4uCZAACZAACZAACVAA8hkgARIgARIgARIggQwjQAGYYQ3O2yUBEiABEiABEiABCkA+AyRAAiRAAiRAAiSQYQQoADOswXm7JEACJEACJEACJEAByGeABEiABEiABEiABDKMAAVghjU4b5cESIAESIAESIAEKAD5DJAACZAACZAACZBAhhGgAMywBuftkgAJkAAJkAAJkAAFIJ8BEiABEiABEiABEsgwAhSAGdbgvF0SIAESIAESIAESoADkM0ACJEACJEACJEACGUaAAjDDGpy3SwIk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RQIkQAIkQAIkQAIZQYACMCOamTdJAiRAAiRAAiRAAu0EKADbWXCLBEiABEiABEiABDKCAAVgRjQzb5IESIAESIAESIAE2glQALaz4BYJkAAJkAAJkAAJZAQBCsCMaGbeJAmQAAmQAAmQAAm0E6AAbGfBLRIgARIgARIgARLICAIUgBnRzLxJEiABEiABEiABEmgnQAHYzoJbJEACJEACJEACJJARBCgAM6KZeZMkQAIkQAIkQAIk0E6AArCdBbdIgARIgARIgARIICMIUABmRDPzJkmABEiABEiABEignQAFYDsLbpEACZAACZAACZBARhCgAMyIZuZNkgAJkAAJkAAJkEA7AQrAdhbcIgESIAESIAESIIGMIEABmBHNzJskARIgARIgARIggXYCFIDtLLhFAiRAAiRAAiRAAhlBgAIwI5qZN0kCJEACJEACJEAC7QQoANtZcIsESIAESIAESIAEMoIABWBGNDNvkgRIgARIgARIgATaCVAAtrPgFgmQAAmQAAmQAAlkBAEKwIxoZt4kCZAACZAACZAACbQToABsZ8EtEiABEiABEiABEsgIAhSAGdHMvEkSIAESIAESIAESaCdAAdjOglskQAIkQAIkQAIkkBEEKAAzopl5kyRAAiRAAiRAAiTQToACsJ0Ft0iABEiABEiABEggIwhQAGZEM/MmSYAESIAESIAESKCdAAVgOwtukQAJkAAJkAAJkEBGEKAAzIhm5k2SAAmQAAmQAAmQQDsBCsB2FtwiARIgARIgARIggYwgQAGYEc3MmyQBEiABEiABEiCBdgIUgO0suEUCJEACJEACJEACGUGAAjAjmpk3SQIkQAIkQAIkQALtBCgA21lwiwRIgARIgARIgAQyggAFYEY0M2+SBEiABEiABEiABNoJdGvfTL2tw83Nan91pWrYX6sONzepo0eOpN5NsMYkQAIkQAIkQAIpQaBHdrbK65Wv+hYVq6KBg2S7V0rU26mSWUdbG045nUjmYxB+u7dvVfsq9yZzNVk3EiABEiABEiCBNCbQf9AQNXzs+JQUgiknAKv27FLbvl2Xxo8Tb40ESIAESIAESCCVCIybOl2VDBuRSlVWKSUA95RuU2VbN6cUYFaWBEiABEiABEgg/QmMHD9RDRszLmVuNGUmgcDzR/GXMs8VK0oCJEACJEACGUUAGgVaJVUsJQQgxvyx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AAECBAgQIJAVUACzvqYTIECAAAECBOoEFMC6SCxEgAABAgQIEMgKKIBZX9MJECBAgAABAnUCCmBdJBYiQIAAAQIECGQFFMCsr+kECBAgQIAAgToBBbAuEgsRIECAAAECBLICCmDW13QCBAgQIECAQJ2AAlgXiYUIECBAgAABAlkBBTDrazoBAgQIECBAoE5AAayLxEIECBAgQIAAgayAApj1NZ0AAQIECBAgUCegANZFYiECBAgQIECAQFZAAcz6mk6AAAECBAgQqBNQAOsisRABAgQIECBAICugAGZ9TSdAgAABAgQI1AkogHWRWIgAAQIECBAgkBVQALO+phMgQIAAAQIE6gQUwLpILESAAAECBAgQyAoogFlf0wkQIECAAAECdQIKYF0kFiJAgAABAgQIZAUUwKyv6QQIECBAgACBOgEFsC4SCxEgQIAAAQIEsgIKYNbXdAIECBAgQIBAnYACWBeJhQgQIECAAAECWQEFMOtrOgECBAgQIECgTkABrIvEQgQIECBAgACBrIACmPU1nQABAgQIECBQJ6AA1kViIQIECBAgQIBAVkABzPqaToAAAQIECBCoE1AA6yKxEAECBAgQIEAgK6AAZn1NJ0CAAAECBAjUCSiAdZFYiAABAgQIECCQFVAAs76mEyBAgAABAgTqBBTAukgsRIAAAQIECBDICiiAWV/TCRAgQIAAAQJ1AgpgXSQWIkCAAAECBAhkBRTArK/pBAgQIECAAIE6AQWwLhILESBAgAABAgSyAgpg1td0AgQIECBAgECdgAJYF4mFCBAgQIAAAQJZAQUw62s6AQIECBAgQKBOQAGsi8RCBAgQIECAAIGsgAKY9TWdAAECBAgQIFAnoADWRWIhAgQIECBAgEBWQAHM+ppOgAABAgQIEKgTUADrIrEQAQIECBAgQCAroABmfU0nQIAAAQIECNQJKIB1kViIAAECBAgQIJAVUACzvqYTIECAAAECBOoEFMC6SCxEgAABAgQIEMgKKIBZX9MJECBAgAABAnUCCmBdJBYiQIAAAQIECGQFFMCsr+kECBAgQIAAgToBBbAuEgsRIECAAAECBLICCmDW13QCBAgQIECAQJ2AAlgXiYUIECBAgAABAlkBBTDrazoBAgQIECBAoE5AAayLxEIECBAgQIAAgayAApj1NZ0AAQIECBAgUCegANZFYiECBAgQ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vqYTIECAAAECBOoEFMC6SCxEgAABAgQIEMgKKIBZX9MJECBAgAABAnUCCmBdJBYiQIAAAQIECGQFFMCsr+kECBAgQIAAgToBBbAuEgsRIECAAAECBLICCmDW13QCBAgQIECAQJ2AAlgXiYUIECBAgAABAlkBBTDrazoBAgQIECBAoE5AAayLxEIECBAgQIAAgayAApj1NZ0AAQIECBAgUCegANZFYiECBAgQIECAQFZAAcz6mk6AAAECBAgQqBNQAOsisRABAgQIECBAICugAGZ9TSdAgAABAgQI1AkogHWRWIgAAQIECBAgkBVQALO+phMgQIAAAQIE6gQUwLpILESAAAECBAgQyAoogFlf0wkQIECAAAECdQIKYF0kFiJAgAABAgQIZAUUwKyv6QQIECBAgACBOgEFsC4SCxEgQIAAAQIEsgIKYNbXdAIECBAgQIBAnYACWBeJhQgQIECAAAECWQEFMOtrOgECBAgQIECgTkABrIvEQgQIECBAgACBrIACmPU1nQABAgQIECBQJ6AA1kViIQIECBAgQIBAVkABzPqaToAAAQIECBCoE1AA6yKxEAECBAgQIEAgK6AAZn1NJ0CAAAECBAjUCSiAdZFYiAABAgQIECCQFVAAs76mEyBAgAABAgTqBBTAukgsRIAAAQIECBDICiiAWV/TCRAgQIAAAQJ1AgpgXSQWIkCAAAECBAhkBRTArK/pBAgQIECAAIE6AQWwLhILESBAgAABAgSyAgpg1td0AgQIECBAgECdgAJYF4mFCBAgQIAAAQJZAQUw62s6AQIECBAgQKBOQAGsi8RCBAgQIECAAIGsgAKY9TWdAAECBAgQIFAnoADWRWIhAgQIECBAgEBWQAHM+ppOgAABAgQIEKgTUADrIrEQAQIECBAgQCAroABmfU0nQIAAAQIECNQJKIB1kViIAAECBAgQIJAVUACzvqYTIECAAAECBOoEFMC6SCxEgAABAgQIEMgKKIBZX9MJECBAgAABAnUCCmBdJBYiQIAAAQIECGQFFMCsr+kECBAgQIAAgToBBbAuEgsRIECAAAECBLICCmDW13QCBAgQIECAQJ2AAlgXiYUIECBAgAABAlkBBTDrazoBAgQIECBAoE5AAayLxEIECBAgQIAAgayAApj1NZ0AAQIECBAgUCegANZFYiECBAgQIECAQFZAAcz6mk6A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AQIECBAgQOACBRTACwzVJREgQIAAAQIETgkogKd03EeAAAECBAgQuEABBfACQ3VJBAgQIECAAIFTAgrgKR33ESBAgAABAgQuUEABvMBQXRIBAgQIECBA4JSAAnhKx30ECBAgQIAAgQsUUAAvMFSXRIAAAQIECBA4JaAAntJxHwECBAgQIEDgAgUUwAsM1SURIECAAAECBE4JKICndNxHgAABAgQIELhAAQXwAkN1SQQIECBAgACBUwIK4Ckd9xEgQIAAAQIELlBAAbzAUF0SAQIECBAgQOCUgAJ4Ssd9BAgQIECAAIELFFAALzBUl0SAAAECBAgQOCWgAJ7ScR8BAgQIECBA4AIFFMALDNUlESBAgAABAgROCSiAp3TcR4AAAQIECBC4QAEF8AJDdUkECBAgQIAAgVMCCuApHfcRIECAAAECBC5QQAG8wFBdEgECBAgQIEDglIACeErHfQQIECBAgACBCxRQAC8wVJdEgAABAgQIEDgloACe0nEfAQIECBAgQOACBRTACwzVJREgQIAAAQIETgkogKd03EeAAAECBAgQuEABBfACQ3VJBAgQIECAAIFTAgrgKR33ESBAgAABAgQuUEABvMBQXRIBAgQIECBA4JSAAnhKx30ECBAgQIAAgQsUUAAvMFSXRIAAAQIECBA4JaAAntJxHwECBAgQIEDgAgUUwAsM1SURIECAAAECBE4JKICndNxHgAABAgQIELhAAQXwAkN1SQQIECBAgACBUwIK4Ckd9xEgQIAAAQIELlBAAbzAUF0SAQIECBAgQOCUwP8B8XFhqmpAlGUAAAAASUVORK5CYII="><!-- iPhone, retina -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">

  <meta name="HandheldFriendly" content="True">
  <meta name="MobileOptimized" content="320">
  <meta name="viewport" content="width=device-width, target-densitydpi=160dpi, initial-scale=1.0, maximum-scale=1, user-scalable=no, minimal-ui">
</head>
<body>
  <div class="container">
    <div class="heading">
      <h1 class="title">2048</h1>
      <div class="scores-container">
        <div class="score-container">0</div>
        <div class="best-container">0</div>
      </div>
    </div>

    <div class="above-game">
      <p class="game-intro">Join the numbers and get to the <strong>2048 tile!</strong></p>
      <a class="restart-button">New Game</a>
    </div>

    <div class="game-container">
      <div class="game-message">
        <p></p>
        <div class="lower">
	        <a class="keep-playing-button">Keep going</a>
          <a class="retry-button">Try again</a>
        </div>
      </div>

      <div class="grid-container">
        <div class="grid-row">
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
        </div>
        <div class="grid-row">
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
        </div>
        <div class="grid-row">
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
        </div>
        <div class="grid-row">
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
          <div class="grid-cell"></div>
        </div>
      </div>

      <div class="tile-container">

      </div>
    </div>

    <p class="game-explanation">
      <strong class="important">How to play:</strong> Use your <strong>arrow keys</strong> to move the tiles. When two tiles with the same number touch, they <strong>merge into one!</strong>
    </p>
    <hr>
    <p>
    <strong class="important">Note:</strong> This site is the official version of 2048. You can play it on your phone via <a href="http://git.io/2048">http://git.io/2048.</a> All other apps or sites are derivatives or fakes, and should be used with caution.
    </p>
    <hr>
    <p>
    Created by <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a> Based on <a href="https://itunes.apple.com/us/app/1024!/id823499224" target="_blank">1024 by Veewo Studio</a> and conceptually similar to <a href="http://asherv.com/threes/" target="_blank">Threes by Asher Vollmer.</a>
    </p>
  </div>

  <script>Function.prototype.bind = Function.prototype.bind || function (target) {
  var self = this;
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};
</script>
  <script>(function () {
  if (typeof window.Element === "undefined" ||
      "classList" in document.documentElement) {
    return;
  }

  var prototype = Array.prototype,
      push = prototype.push,
      splice = prototype.splice,
      join = prototype.join;

  function DOMTokenList(el) {
    this.el = el;
    // The className needs to be trimmed and split on whitespace
    // to retrieve a list of classes.
    var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }

  DOMTokenList.prototype = {
    add: function (token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    },
    contains: function (token) {
      return this.el.className.indexOf(token) != -1;
    },
    item: function (index) {
      return this[index] || null;
    },
    remove: function (token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    },
    toString: function () {
      return join.call(this, ' ');
    },
    toggle: function (token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    }
  };

  window.DOMTokenList = DOMTokenList;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(HTMLElement.prototype, 'classList', function () {
    return new DOMTokenList(this);
  });
})();
</script>
  <script>(function () {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      },
      timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
}());
</script>
  <script>function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Respond to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
</script>
  <script>function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
</script>
  <script>function Grid(size, previousState) {
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }

  return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    size: this.size,
    cells: cellState
  };
};
</script>
  <script>function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};
</script>
  <script>window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
};
</script>
  <script>function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
</script>
  <script>// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
</script>
</body>
</html>
`
