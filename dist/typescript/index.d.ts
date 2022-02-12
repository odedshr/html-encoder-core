import { Instruction } from '../instruction';
export declare type TargetType = 'js' | 'es' | 'ts' | 'code';
export declare function transpile(instructions: Instruction, type: TargetType, isSSR?: boolean): string;
