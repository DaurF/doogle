import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { InteractionsModule } from './interactions/interactions.module';
import { CategoriesModule } from './categories/categories.module';
import { ProducersModule } from './producers/producers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_HOST, {
      connectionFactory: (connection) => {
        connection.plugin((schema) => {
          schema.set('toJSON', {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
              ret.id = ret._id;
              delete ret._id;
            },
          });
        });

        return connection;
      },
    }),
    UsersModule,
    ProductsModule,
    InteractionsModule,
    CategoriesModule,
    ProducersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
