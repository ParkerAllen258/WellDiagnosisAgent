import type { ThemeConfig } from 'antd'

export const themeConfig = {
  token: {
    colorPrimary: '#2D7FB3',
    colorSuccess: '#3F9A61',
    colorWarning: '#D58A32',
    colorError: '#C8524A',
    colorText: '#17364D',
    colorBgLayout: '#EDF3F8',
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Table: { headerBg: '#F3F7FA', headerColor: '#17364D' },
    Button: { controlHeight: 32 },
    Card: { bodyPadding: 16 },
  },
} satisfies ThemeConfig
