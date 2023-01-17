import { defineComponent, PropType } from "vue";
import { TuyaClient } from "../utils/tuya";
import { Device } from "../Types/Device";

export default defineComponent({
  name: "DeviceList",
  props: {
    client: { type: Object as PropType<TuyaClient>, required: true },
    devices: { type: Array as PropType<Device[]>, required: true },
  },
  setup(props) {
    return () => (
      <div>
        <h1>Device List</h1>
        {props.devices.map((device) => (
          <p>{device.name}</p>
        ))}
      </div>
    );
  },
});
