declare module 'africastalking' {
  interface AfricasTalkingOptions {
    apiKey: string
    username: string
  }

  interface SmsOptions {
    to: string[]
    message: string
    from?: string
  }

  interface SmsSendResult {
    SMSMessageData: {
      Message: string
      Recipients: Array<{
        statusCode: number
        number: string
        status: string
        cost: string
        messageId: string
      }>
    }
  }

  interface SmsService {
    send(options: SmsOptions): Promise<SmsSendResult>
  }

  interface AfricasTalkingInstance {
    SMS: SmsService
  }

  function AfricasTalking(options: AfricasTalkingOptions): AfricasTalkingInstance
  export = AfricasTalking
}
