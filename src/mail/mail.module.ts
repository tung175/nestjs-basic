import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "src/jobs/schemas/job.schema";
import {
  Subscriber,
  SubscriberSchema,
} from "src/subscribers/schemas/subscriber.schema";
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          secure: false,
          auth: {
            user: configService.get<string>("EMAIL_AUTH_USER"),
            pass: configService.get<string>("EMAIL_AUTH_PASSWORD"),
          },
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        preview:
          true
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
