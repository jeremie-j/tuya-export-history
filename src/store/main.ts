import { ref } from "vue";
import { TuyaClient } from "@/utils/tuya";
import { defineStore } from "pinia";
import { Device } from "../Types/Device";

export const useStore = defineStore("mainStore", {
  state: () => {
    return {
      tuyaClient: new TuyaClient(),
      devices: [] as Device[],
      loadingDevices: false,
      selectedDevice: null as Number | null,
    };
  },
});
