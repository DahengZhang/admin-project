const filters = (option) => {
    if (!option.filters || typeof option.filters !== 'string') {
        return option
    }

    option.filters = [option.filters === 'ppt'
                    ? { name: 'PPT', extensions: ['ppt', 'pptx'] }
                    : { name: 'MP3', extensions: ['mp3'] }]

    return option
}

export {
    filters
}
