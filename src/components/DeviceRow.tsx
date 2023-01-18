import { defineComponent, PropType } from "vue";
import { Device } from "../Types/Device";
import Icon from "./Icon";

import "./DeviceRow.css";
import { getRandomValues } from "crypto";

interface iconMapping {
  iconName: string;
  color: string[];
}

const iconDeviceTypeMapping: { [key: string]: iconMapping } = {
  Switch: {
    iconName: "switch.2",
    color: ["#55A1FA", "#356CEB"],
  },
  Curtain: {
    iconName: "switch.2",
    color: ["#55A1FA", "#356CEB"],
  },
  Socket: {
    iconName: "powerplug",
    color: ["#F6C54C", "#F39C2C"],
  },
  "Contact Sensor": {
    iconName: "door.left.hand.open",
    color: ["#84FBFF", "#3FC1F3"],
  },
  "Temperature and Humidity Sensor": {
    iconName: "thermometer.medium",
    color: ["#2c994f", "#1e7c48"],
  },
  unknown: {
    iconName: "questionmark.square.dashed",
    color: ["#959292", "#959292"],
  },
};

const DeviceRowIcon = defineComponent({
  name: "DeviceRowIcon",
  props: {
    categoryName: { type: String, required: true },
  },
  setup(props) {
    const icon =
      props.categoryName in iconDeviceTypeMapping
        ? iconDeviceTypeMapping[props.categoryName]
        : iconDeviceTypeMapping["unknown"];

    return () => (
      <div
        style={{
          width: "20px",
          height: "20px",
          background: `linear-gradient(180deg, ${icon.color[0]} 0%, ${icon.color[1]} 100%)`,
          "border-radius": "5px",
          "margin-right": "5px",
          "min-width": "20px",
          "text-align": "center",
          "line-height": "100%",
        }}
      >
        <Icon name={icon.iconName} size={12} />
      </div>
    );
  },
});

export default defineComponent({
  name: "Device",
  props: {
    device: { type: Object as PropType<Device>, required: true },
    onClick: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    return () => (
      <div class="device-row" onClick={props.onClick}>
        <DeviceRowIcon categoryName={props.device.category_name} />
        <span class="text">{props.device.name}</span>
      </div>
    );
  },
});
