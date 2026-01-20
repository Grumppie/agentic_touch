// base padding for root level file system items
export const BASE_PADDING = 12
// additional padding per nesting level
export const LEVEL_PADDING = 12;

export const getItemPadding = (level:number, isFile: boolean)=>{

    // files don't have the chevron drop down button hence extra padding
    const fileOffset = isFile ? 16: 0
    return BASE_PADDING + level * LEVEL_PADDING + fileOffset
}