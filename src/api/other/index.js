// 外部API
import axios from "axios";
import settings from "@/settings";

export const serviceOther = axios.create({
  timeout: settings.timeout,
  withCredentials: true
})

export const keyMapQQ = "44EBZ-O5NC5-SPLIX-QK42R-ECPWE-ENFJM"
export const baseURLMapQQ = '/baseURLMapQQ'

export const mapQQRequestG = () => {
  return new Promise((resolve, reject) => {
    serviceOther({method: 'get', baseURL: baseURLMapQQ, url: 'ws/location/v1/ip', params: {key:keyMapQQ},})
      .then(result => resolve(result))
      .catch(error => reject(error))
  })
}
