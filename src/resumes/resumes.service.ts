import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>
  ) {}
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const {url, companyId, jobId} = createUserCvDto
    const {_id , email} = user
    // const newCv = await this.resumeModel.create({
    //   ...createUserCvDto,
    //   email: user.email,
    //   userId: user._id,
    //   status: "PENDING",
    //   history: [
    //     {
    //       status: "PENDING",
    //       updatedAt: new Date,
    //       updatedBy: {
    //         _id: user._id,
    //         email: user.email
    //       }
    //     }
    //   ],
    //   createdBy: {
    //     _id: user._id,
    //     email: user.email
    //   }
    // })
    const newCv = await this.resumeModel.create({
      url, companyId, jobId, email,
      userId: _id,
      status: "PENDING",
      createdBy: {
        _id: _id,
        email: email
      },
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })
    return {
      _id: newCv?._id,
      createdAt: newCv?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, projection, population,  } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let { sort }: any = aqp(qs);
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      sort = "-updatedAt";
    }
    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Not found company") ;
    }
    return await this.resumeModel.findOne({
      _id: id,
    })
  }

  async findOneByUser(user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      throw new BadRequestException("Not found resume")
    }

    return await this.resumeModel.find({
      userId: user._id
    })
    .sort("-createdAt").populate([
      {
        path: "companyId",
        select: {name: 1}
      },
      {
        path: "jobId",
        select: {name: 1}
      }
    ])
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Not found resume") ;
    }
    return await this.resumeModel.updateOne(
      { _id: id },
      {
        status, 
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        },
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    return this.resumeModel.softDelete({
      _id: id,
    });
  }
}
