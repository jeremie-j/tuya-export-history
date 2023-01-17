<script setup lang="ts">
import { ref } from "vue";
import DeviceList from "./components/DeviceList";
import { TuyaClient } from "./utils/tuya";
import { Device } from "./Types/Device";
</script>

<template>
  <header></header>
  <DeviceList :client="client" :devices="devices"></DeviceList>
</template>
<script lang="ts">
const client = ref<TuyaClient>(new TuyaClient());
await client.value.getAccessToken();
const devices = ref<Device[]>(
  (
    await client.value.requestSigned({
      method: "GET",
      path: "/v1.3/iot-03/devices",
      query: {
        source_type: "tuyaUser",
        source_id: import.meta.env.VITE_TUYAUSERID,
      },
    })
  ).result.list
);
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
