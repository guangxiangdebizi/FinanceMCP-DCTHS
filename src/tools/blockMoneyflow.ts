import { TushareClient } from "../utils/tushareClient.js";

/**
 * 板块资金流向工具
 * 支持东财和同花顺两种数据源
 */
export const blockMoneyflow = {
  name: "get_block_moneyflow",
  description: "获取板块资金流向数据。支持选择东财（DongCai）或同花顺（TongHuaShun）数据源。",
  parameters: {
    type: "object",
    properties: {
      block_code: {
        type: "string",
        description: "板块代码（如 BK0001）"
      },
      trade_date: {
        type: "string",
        description: "交易日期（格式：YYYYMMDD，如 20231201）"
      },
      start_date: {
        type: "string",
        description: "开始日期（格式：YYYYMMDD）"
      },
      end_date: {
        type: "string",
        description: "结束日期（格式：YYYYMMDD）"
      },
      data_source: {
        type: "string",
        enum: ["dongcai", "tonghuashun"],
        description: "数据源选择：dongcai（东财）或 tonghuashun（同花顺）"
      }
    },
    required: ["data_source"]
  },

  async run(args: { 
    block_code?: string; 
    trade_date?: string; 
    start_date?: string; 
    end_date?: string; 
    data_source: "dongcai" | "tonghuashun" 
  }, token?: string) {
    try {
      // 参数验证
      if (!args.data_source) {
        throw new Error("数据源 data_source 是必填参数，请选择 'dongcai' 或 'tonghuashun'");
      }

      // 初始化 Tushare 客户端
      const client = new TushareClient(token);

      // 根据数据源选择 API
      let apiName: string;
      if (args.data_source === "dongcai") {
        apiName = "dc_bk_moneyflow";
      } else if (args.data_source === "tonghuashun") {
        apiName = "ths_bk_moneyflow";
      } else {
        throw new Error("无效的数据源，请选择 'dongcai' 或 'tonghuashun'");
      }

      // 构建查询参数
      const params: Record<string, any> = {};
      if (args.block_code) params.block_code = args.block_code;
      if (args.trade_date) params.trade_date = args.trade_date;
      if (args.start_date) params.start_date = args.start_date;
      if (args.end_date) params.end_date = args.end_date;

      // 调用 API
      const data = await client.call(apiName, params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 板块资金流向查询结果\n\n数据源：${args.data_source === "dongcai" ? "东财" : "同花顺"}\n\n暂无数据`
          }]
        };
      }

      // 格式化输出
      let resultText = `📊 板块资金流向查询结果\n\n`;
      resultText += `数据源：${args.data_source === "dongcai" ? "东财" : "同花顺"}\n`;
      resultText += `查询条件：${args.block_code || "全部板块"} ${args.trade_date || args.start_date + "~" + args.end_date || ""}\n\n`;
      
      // 显示前20条数据
      const displayData = formattedData.slice(0, 20);
      resultText += `共 ${formattedData.length} 条数据，显示前 ${displayData.length} 条：\n\n`;
      
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.name || item.block_code || ""}\n`;
        Object.entries(item).forEach(([key, value]) => {
          resultText += `- **${key}**: ${value}\n`;
        });
        resultText += `\n`;
      });

      return {
        content: [{
          type: "text" as const,
          text: resultText
        }]
      };

    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 板块代码格式是否正确\n3. 日期格式是否正确（YYYYMMDD）\n4. 是否有该接口的访问权限`
        }],
        isError: true
      };
    }
  }
};

