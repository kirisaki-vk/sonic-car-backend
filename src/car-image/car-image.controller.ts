import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UploadedFile,
    Logger,
    UseInterceptors,
    BadRequestException,
} from "@nestjs/common";
import { CarImageService } from "./car-image.service";
import { UpdateCarImageDto } from "./dto/update-car-image.dto";
import { StorageService } from "../storage/storage.service";
import { uuid } from "@supabase/supabase-js/dist/main/lib/helpers";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from "node:path";

@Controller("car-image")
export class CarImageController {
    private readonly logger = new Logger(CarImageController.name);
    constructor(
        private readonly carImageService: CarImageService,
        private readonly storageService: StorageService,
    ) {}

    @Post(":carId")
    @UseInterceptors(
        FileInterceptor("image", {
            limits: {
                fileSize: 5000000,
            },
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(png|jpeg|jpg)/)) {
                    callback(
                        new BadRequestException(
                            "Wrong filetype. Please upload an image file",
                        ),
                        false,
                    );
                }
                callback(undefined, true);
            },
        }),
    )
    async create(
        @Param("carId") carId: string,
        @UploadedFile() image: Express.Multer.File,
    ) {
        this.logger.log("Treating image upload of " + image.originalname);
        const fileExtension = path.extname(image.originalname);
        this.logger.log("Detected image extension: " + fileExtension);
        const imageKey = uuid();
        this.logger.log("Generated uuid " + imageKey);
        const savedImageName = imageKey + fileExtension;
        this.logger.log("Saved image name: " + savedImageName);
        const extArr = fileExtension.split("");
        extArr.shift();
        const mimeType = `image/${extArr.join("")}`;
        await this.storageService.saveCarImage(
            carId,
            savedImageName,
            image.buffer,
            mimeType,
        );
        const imageData = await this.carImageService.create({
            carId,
            imageUrl: savedImageName,
        });
        this.logger.log("Generated mime type: " + mimeType);
        return imageData;
    }

    @Get()
    findAll() {
        return this.carImageService.findAll();
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @Body() updateCarImageDto: UpdateCarImageDto,
    ) {
        return this.carImageService.update(id, updateCarImageDto);
    }

    @Delete(":id")
    async remove(@Param("id") id: string) {
        // const result = await this.storageService.deleteCarImage(id);
        return this.carImageService.remove(id);
    }

    @Get(":carId")
    getCarImages(@Param("carId") carId: string) {
        return this.storageService.getCarImages(carId);
    }
}