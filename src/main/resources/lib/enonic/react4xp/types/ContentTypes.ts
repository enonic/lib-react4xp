import type {Content, PageComponent} from '@enonic-types/core';

export type PageTemplateContent = Content<{
	supports: string[]
}, 'portal:page-template', PageComponent>;
