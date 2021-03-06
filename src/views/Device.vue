<template>
  <div class="device">
    <v-row
      align="center"
      style="height: 1000px;"
    >
      <v-col>
        <v-row justify="center">
          <img
            id="bulb"
            :src="require(`../assets/bulb_${toggle ? 'on': 'off'}.png`)"
            width="600px"
            v-bind:style="{backgroundColor: color}"
          />
        </v-row>
      </v-col>
      <v-divider
        vertical
      ></v-divider>
      <v-col>
        <v-row justify="center">
          <v-col cols="6">
            <v-color-picker id="color-picker" v-model="color" :disabled="disabled"></v-color-picker>
            <v-slider
              v-model="slider"
              max="254"
              min="1"
              :disabled="!toggle"
              :style="{ width: color_picker_width}"
              label="Brightness"
            ></v-slider>
            <v-switch v-model="colorloop" v-on:change="toggleColorLoop()" label="ColorLoop"></v-switch>
            <v-switch v-model="toggle" v-on:change="toggleLight()" label="Power On/Off"></v-switch>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
  name: "Device",
  props: ["id"],

  data: () => ({
    color: "#000000",
    toggle: false,
    slider: 0,
    colorloop: false,
    disabled: true,
    color_picker_width: "300px",
    bridge: "",
    user: ""
  }),
  mounted: function() {
    this.color_picker_width =
      document.getElementById("color-picker").clientWidth + "px";
    this.bridge = this.getBridge();
    this.user = this.getUser();
  },
  watch: {
    color() {
      axios.put(
        `http://${this.bridge}/api/${this.user}/lights/${this.id}/state/`,
        {
          xy: this.color_correction(...this.hexToRgb()),
          on: true
        }
      );
      console.log(this.hexToRgb());
      console.log(this.id);
    },
    slider() {
      this.changeBrightness();
    },
    device_id() {
      this.device_id = this.id;
    }
  },
  methods: {
    color_correction(r, g, b) {
      const gamma_colors = [
        this._gammaCorrection(r / 255),
        this._gammaCorrection(g / 255),
        this._gammaCorrection(b / 255)
      ];

      const { X, Y, Z } = this._D65Correction(...gamma_colors);

      const x = (X / (X + Y + Z)).toFixed(4);
      const y = (Y / (X + Y + Z)).toFixed(4);

      return [isNaN(x) ? 0 : +x, isNaN(y) ? 0 : +y];
    },

    _gammaCorrection(color) {
      return color > 0.04045
        ? Math.pow((color + 0.055) / 1.055, 2.4)
        : color / 12.92;
    },

    _D65Correction(r, g, b) {
      const X = r * 0.664511 + g * 0.154324 + b * 0.162028;
      const Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
      const Z = r * 0.000088 + g * 0.07231 + b * 0.986039;

      return {
        X,
        Y,
        Z
      };
    },
    ...mapGetters(["getBridge", "getUser"]),
    // Code borrowed from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    hexToRgb() {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.color);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ]
        : null;
    },
    toggleLight() {
      console.log(`Switch is ${this.toggle}`);
      this.disabled = !this.toggle;

      var json = {
        on: this.toggle
      };
      axios.put(
        `http://${this.bridge}/api/${this.user}/lights/${this.id}/state/`,
        json
      );
      if (this.colorloop) {
        this.toggleColorLoop();
      }
    },
    changeBrightness() {
      console.log(`Slider is ${this.slider}`);
      var json = {
        bri: this.slider
      };
      axios.put(
        `http://${this.bridge}/api/${this.user}/lights/${this.id}/state/`,
        json
      );
    },
    toggleColorLoop() {
      console.log(`Colorloop is ${this.colorloop}`);
      this.disabled = this.colorloop || !this.toggle;
      var json = {
        effect: `${this.colorloop ? "colorloop" : "none"}`
      };
      axios.put(
        `http://${this.bridge}/api/${this.user}/lights/${this.id}/state/`,
        json
      );
    }
  }
};
</script>
