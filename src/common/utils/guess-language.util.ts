import { LanguageCode } from 'iso-639-1';

export function guessLanguage(str: string): LanguageCode | null {
    switch (true) {
        // кириллица
        case (/[а-яё]/i.test(str)):
            return 'ru';
        // хирагана + катакана
        case (/[\u3040-\u309f\u30a0-\u30ff]/i.test(str)):
            return 'ja';
        // китайские иероглифы
        case (/[\u4e00-\u9fff\u3400-\u4dbf]/i.test(str)):
            return 'zh';
        // корейский хангыль
        case (/[\uac00-\ud7af]/i.test(str)):
            return 'ko';
        // латиница всегда уезжает в английский
        case (/[a-z]/i.test(str)):
            return 'en';
        // если не нашли язык
        default:
            return null;
    }
}