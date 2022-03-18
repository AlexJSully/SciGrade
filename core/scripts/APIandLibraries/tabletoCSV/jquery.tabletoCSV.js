jQuery.fn.tableToCSV = function () {
  const clean_text = function (text) {
    text = text.replace(/"/g, '""')
    return '"' + text + '"'
  }

  $(this).each(function () {
    const table = $(this)
    const caption = $(this).find('caption').text()
    let title = []
    let rows = []

    $(this).find('tr').each(function () {
      let data = []
      $(this).find('th').each(function () {
        const text = clean_text($(this).text())
        title.push(text)
      })
      $(this).find('td').each(function () {
        const text = clean_text($(this).text())
        data.push(text)
      })
      data = data.join(',')
      rows.push(data)
    })
    title = title.join(',')
    rows = rows.join('\n')

    const csv = title + rows
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    const download_link = document.createElement('a')
    download_link.href = uri
    const ts = new Date().getTime()
    if (caption == '') {
      download_link.download = ts + '.csv'
    } else {
      download_link.download = caption + '.csv' // modified this line to remove the ts name
    }
    document.body.appendChild(download_link)
    download_link.click()
    document.body.removeChild(download_link)
  })
}
