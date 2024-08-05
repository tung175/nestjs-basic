import { Controller, Get } from "@nestjs/common";
import { MailService } from "./mail.service";
import { Public, ResponseMessage } from "src/auth/decorator/customize";
import { MailerService } from "@nestjs-modules/mailer";
import { SubscribersService } from "src/subscribers/subscribers.service";
import { JobsService } from "src/jobs/jobs.service";
import { InjectModel } from "@nestjs/mongoose";
import { Job, JobDocument } from "src/jobs/schemas/job.schema";
import { Subscriber } from "src/subscribers/schemas/subscriber.schema";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('mail')
@Controller("mail")
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<JobDocument>,
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>
  ) {}


  @Get()
  @Public()
  @Cron("0 0 0 * * 0") //0 am every sunday
  @ResponseMessage("Test email")
  async handleTestEmail() {
    // const jobs = [
    //   { name: "abc", company: "abc", salary: "5000", skills: ["22", "nodejs"] },
    // ];

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ",
            skills: item.skills,
          };
        });
        await this.mailerService.sendMail({
          to: "duongkq3@gmail.com",
          from: '"Support Team" <support@example.com>', // override default from
          subject: "Welcome to Nice App! Confirm your Email",
          template: "job",
          context: {
            receiver: subs.name,
            jobs: jobs,
          },
        });
      }
    }
  }
}
