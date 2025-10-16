import axios from "axios";

/**
 * Tushare API Client
 * 支持通过环境变量或直接传入 token 进行调用
 */
export class TushareClient {
  private token: string;
  private apiUrl = "http://api.tushare.pro";

  constructor(token?: string) {
    this.token = token || process.env.TUSHARE_TOKEN || "";
    if (!this.token) {
      throw new Error("Tushare token is required. Please set TUSHARE_TOKEN environment variable or pass it directly.");
    }
  }

  /**
   * 调用 Tushare API
   * @param apiName API 接口名称
   * @param params 接口参数
   * @param fields 返回字段（可选）
   */
  async call(apiName: string, params: Record<string, any> = {}, fields?: string[]): Promise<any> {
    try {
      const response = await axios.post(this.apiUrl, {
        api_name: apiName,
        token: this.token,
        params,
        fields: fields || []
      }, {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.code !== 0) {
        throw new Error(`Tushare API Error: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Tushare API Request Failed: ${error.response.status} - ${error.response.data?.msg || error.message}`);
      }
      throw new Error(`Tushare API Request Failed: ${error.message}`);
    }
  }

  /**
   * 格式化 Tushare 返回的数据为对象数组
   */
  formatData(data: any): any[] {
    if (!data || !data.fields || !data.items) {
      return [];
    }

    const fields = data.fields;
    return data.items.map((item: any[]) => {
      const obj: Record<string, any> = {};
      fields.forEach((field: string, index: number) => {
        obj[field] = item[index];
      });
      return obj;
    });
  }
}

