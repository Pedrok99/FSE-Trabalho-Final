#include "dht11.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "wifi.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "esp_system.h"
#include "mqtt.h"


#define TAG "Main"

xSemaphoreHandle wifi_semaphore;

void onWifiConnected(void *params){
    while (true)
    {
        if(xSemaphoreTake(wifi_semaphore, portMAX_DELAY)){
            ESP_LOGI(TAG, "Conectado ao wifi");
            mqtt_start();

        }
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}

void app_main(){

    //init NVS
    esp_err_t ret = nvs_flash_init()
    ;
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK( ret );

    wifi_semaphore = xSemaphoreCreateBinary();

    wifi_start();

    xTaskCreate(&onWifiConnected, "onWifiConnected", 2048, NULL, 1, NULL);


    // DHT11_init(GPIO_NUM_4);

    // while(1){
    //     printf("Temperature is %d \n", DHT11_read().temperature);
    //     printf("Humidity is %d\n", DHT11_read().humidity);
    //     printf("Status code is %d\n", DHT11_read().status);
    //     vTaskDelay(2000 / portTICK_PERIOD_MS);
    //     mqtt_start();
    // }
}