import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI', { infer: true });
        console.log('Mongo URI:', uri); // check if it's undefined
        return { uri };
      },
      inject: [ConfigService],
    }),
    ChatModule,
    AuthModule,
    CoreModule,
    SharedModule,
  ],
})
export class AppModule {}
