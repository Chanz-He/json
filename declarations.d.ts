declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
};

declare module 'rollup-plugin-terser'

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys: () => string[];
    (id: string): any;
  };
};

declare module "*.svg?react" {
  import { FC, SVGProps } from 'react';
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module '*.riv' {
  const content: any;
  export default content;
}