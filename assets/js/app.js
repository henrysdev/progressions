// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.

// import "../css/app.scss"
const _css = require("../css/app.scss");

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
// import {Socket} from "phoenix"
import "./socket.js"

import "phoenix_html"

import "./audioplayer.ts"

import "./player/player.js"

import greet from "./hello.ts";
document.querySelector("section.phx-hero h1").innerHTML = greet("Phoenix");
