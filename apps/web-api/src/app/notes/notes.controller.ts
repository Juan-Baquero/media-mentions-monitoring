import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteDto } from '@repo/shared';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('set-note')
  async setNote(@Body() noteDto: NoteDto) {
    try {
      return await this.notesService.setNote(noteDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request setNote ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-note')
  async sendNote(@Body() noteDto: NoteDto) {
    try {
      return await this.notesService.sendMessage(noteDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request seendNote ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('import-excel')
  async importExcel(@Body() notes: NoteDto[]) {
    try {
      return await this.notesService.importNotes(notes);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request importExcel ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
