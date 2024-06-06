import { Module } from "@nestjs/common";
import { MailerModule } from "../mailer/mailer.module";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule, MailerModule],
    controllers: [AppointmentController],
    providers: [AppointmentService],
})
export class AppointmentModule {}
