import { TushareClient } from "../utils/tushareClient.js";

/**
 * 东方财富板块成分
 * 接口：dc_member
 * 描述：获取东方财富板块每日成分数据
 */
export const dcMember = {
  name: "get_dc_member",
  description: "获取东方财富板块成分股数据。可查询指定板块的成分股，或查询指定股票所属的板块。支持历史成分查询。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "板块指数代码，查询该板块包含的成分股"
      },
      con_code: {
        type: "string",
        description: "成分股票代码，查询该股票所属的板块"
      },
      trade_date: {
        type: "string",
        description: "交易日期（YYYYMMDD格式），查询指定日期的成分"
      }
    },
    required: []
  },

  async run(args: { 
    ts_code?: string; 
    con_code?: string;
    trade_date?: string;
  }, token?: string) {
    try {
      const client = new TushareClient(token);

      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.con_code) params.con_code = args.con_code;
      if (args.trade_date) params.trade_date = args.trade_date;

      const data = await client.call("dc_member", params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 东方财富板块成分查询结果\n\n暂无数据`
          }]
        };
      }

      let resultText = `📊 东方财富板块成分查询结果\n\n`;
      
      if (args.ts_code) {
        resultText += `板块代码：${args.ts_code}\n`;
      }
      if (args.con_code) {
        resultText += `股票代码：${args.con_code}\n`;
      }
      if (args.trade_date) {
        resultText += `交易日期：${args.trade_date}\n`;
      }
      resultText += `数据数量：${formattedData.length}\n\n`;
      
      const displayData = formattedData.slice(0, 50);
      resultText += `显示前 ${displayData.length} 条：\n\n`;
      
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.name || ""} (${item.con_code || ""})\n`;
        resultText += `- **交易日期**: ${item.trade_date}\n`;
        resultText += `- **板块代码**: ${item.ts_code}\n`;
        resultText += `- **成分代码**: ${item.con_code}\n`;
        resultText += `- **成分名称**: ${item.name}\n\n`;
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
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 板块代码或股票代码格式是否正确\n3. 日期格式是否正确（YYYYMMDD）\n4. 是否有该接口的访问权限（需6000积分）`
        }],
        isError: true
      };
    }
  }
};

