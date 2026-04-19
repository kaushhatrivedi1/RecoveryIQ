declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BACKEND_URL?: string;
    NEXT_PUBLIC_MQTT_BASE?: string;
    NEXT_PUBLIC_MQTT_USER?: string;
    NEXT_PUBLIC_MQTT_PASS?: string;
  }
}

declare const process: { env: NodeJS.ProcessEnv };
