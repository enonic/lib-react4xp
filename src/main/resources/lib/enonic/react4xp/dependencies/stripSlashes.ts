const slashesAtBeginning = /^\/+/;
const slashesAtEnd = /\/+$/;


export function stripSlashes(suffix :string) {
    return suffix.replace(slashesAtBeginning, '').replace(slashesAtEnd, '');
};
