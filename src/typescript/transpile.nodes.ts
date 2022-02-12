import { Instruction } from '../instruction';
import { getAttributes } from './transpile.attributes';
import { getProcessingInstruction } from './transpile.processing-instruction';

export function getNode(instruction: Instruction, isSSR: boolean = false): string {
  switch (instruction.type) {
    case 'document': return getDocument(instruction, isSSR);
    case 'documentFragment': return getDocumentFragment(instruction, isSSR);
    case 'text': return getTextNode(instruction);
    case 'element': return getHTMLElement(instruction, isSSR);
    case 'comment': return getComment(instruction);
    case 'ProcessingInstruction': return getProcessingInstruction(instruction, isSSR);
  }
}

export function appendNode(instruction: Instruction, isSSR: boolean = false): string {
  const node: string = getNode(instruction, isSSR);
  switch (instruction.type) {
    case 'documentFragment':
    case 'text':
    case 'element':
    case 'comment': return `node.appendChild(${node});`;
    case 'ProcessingInstruction': return getProcessingInstruction(instruction, isSSR);
  }

  return '';
}

export function getDocument(instruction: Instruction, isSSR: boolean) {
  const name: string = instruction.attributes?.name as string;
  const publicId: string = instruction.attributes?.publicId as string || '';
  const systemId: string = instruction.attributes?.systemId as string || '';
  return `(docElm => {
    const node = docElm;
    docElm.insertBefore(docElm.implementation.createDocumentType('${name}', '${publicId}', '${systemId}'), docElm.childNodes[0]);
    docElm.removeChild(docElm.childNodes[1]);
    ${appendChildren(instruction.children, isSSR)}
    return docElm;
  })(self.docElm)`;
}

export function getDocumentFragment(instruction: Instruction, isSSR: boolean) {
  return `(docElm => {
    const node = docElm.createDocumentFragment();
    ${instruction ? appendChildren(instruction.children, isSSR) : ''}return node;
  })(self.docElm)`;
}

export function getComment(instruction: Instruction) {
  return `self.docElm.createComment(\`${instruction.value}\`)`;
}

function getTextNode(instruction: Instruction) {
  return `self.docElm.createTextNode(\`${instruction.value}\`)`;
}

function getHTMLElement(instruction: Instruction, isSSR: boolean) {
  const attributes = (instruction.attributes) ? getAttributes(instruction.attributes) : '';

  return `(docElm =>{
    const node = docElm.createElement('${instruction.tag}');
    ${attributes}${appendChildren(instruction.children, isSSR)}
    return node;
  })(self.docElm)`;
}

function appendChildren(children: Instruction[] = [], isSSR: boolean): string {
  return children.map(child => appendNode(child, isSSR)).join('\n');
}