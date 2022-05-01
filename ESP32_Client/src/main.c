#include "dht11.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "freertos/semphr.h"

#include "wifi.h"
#include "mqtt.h"

xSemaphoreHandle conexaoMQTTSemaphore;

void trataComunicacaoComServidor(void *params)
{
    char mensagem[50];
    if (xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY))
    {
        while (true)
        {
            float temperatura = 20.0 + (float)rand() / (float)(RAND_MAX / 10.0);
            sprintf(mensagem, "temperatura1: %f", temperatura);
            mqtt_envia_mensagem("sensores/temperatura", mensagem);
            vTaskDelay(3000 / portTICK_PERIOD_MS);
        }
    }
}

void app_main()
{

    // init NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_start();

    conexaoMQTTSemaphore = xSemaphoreCreateBinary();

    mqtt_start();

    DHT11_init(GPIO_NUM_4);

    xTaskCreate(&trataComunicacaoComServidor, "Comunicação com Broker", 4096, NULL, 1, NULL);

    // while (1)
    // {
    //     printf("Temperature is %d \n", DHT11_read().temperature);
    //     printf("Humidity is %d\n", DHT11_read().humidity);
    //     printf("Status code is %d\n", DHT11_read().status);
    //     vTaskDelay(2000 / portTICK_PERIOD_MS);
    // }
}