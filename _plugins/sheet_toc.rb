# Filters used by the sheet layout.
#
# 1. `gfm_heading_ids` rewrites kramdown's heading ids to the GitHub-flavoured
#    slugs the markdown files were written against. kramdown strips leading
#    non-letters, so "## 1. Docker Overview" becomes "docker-overview"; the
#    in-page links in every cheat sheet expect "1-docker-overview".
# 2. `toc` builds the sidebar list of contents from the converted page.

module CheatSheets
  HEADING = %r{<h([1-6])(\s[^>]*)?>(.*?)</h\1>}m
  ENTITIES = {
    "&amp;" => "&", "&lt;" => "<", "&gt;" => ">",
    "&quot;" => '"', "&#39;" => "'", "&nbsp;" => " "
  }.freeze

  module_function

  def text_of(html)
    text = html.gsub(%r{<[^>]+>}m, "")
    ENTITIES.each { |entity, char| text = text.gsub(entity, char) }
    text
  end

  # GitHub-style slug: lowercase, drop punctuation, spaces to hyphens.
  def slug(text)
    text.downcase
        .gsub(/[^\p{Alnum}\s_-]/, "")
        .strip
        .gsub(/\s+/, "-")
  end

  def relabel(html)
    counts = Hash.new(0)

    html.gsub(HEADING) do
      level, attrs, inner = Regexp.last_match(1), Regexp.last_match(2).to_s, Regexp.last_match(3)
      base = slug(text_of(inner))
      next Regexp.last_match(0) if base.empty?

      id = base
      if counts[base].positive?
        id = "#{base}-#{counts[base]}"
      end
      counts[base] += 1

      if attrs =~ /\bid="[^"]*"/
        attrs = attrs.sub(/\bid="[^"]*"/, %(id="#{id}"))
      else
        attrs = %( id="#{id}") + attrs
      end

      "<h#{level}#{attrs}>#{inner}</h#{level}>"
    end
  end

  def headings(html, max_depth)
    found = []
    html.scan(HEADING) do
      level = Regexp.last_match(1).to_i
      attrs = Regexp.last_match(2).to_s
      inner = Regexp.last_match(3)
      next if level > max_depth

      id = attrs[/\bid="([^"]+)"/, 1]
      next if id.nil?

      found << [level, id, inner]
    end
    found
  end

  def toc(html, max_depth = 3)
    items = headings(html, max_depth.to_i)
    return "" if items.empty?

    out = +"<ul>\n"
    stack = [items.first[0]]

    items.each_with_index do |(level, id, inner), index|
      link = %(<a href="##{id}" id="toc-#{id}">#{inner}</a>)

      if index.zero?
        out << "<li>" << link
      elsif level == stack.last
        out << "</li>\n<li>" << link
      elsif level > stack.last
        stack << level
        out << "\n<ul>\n<li>" << link
      else
        out << "</li>\n"
        while stack.length > 1 && level < stack.last
          stack.pop
          out << "</ul>\n</li>\n"
        end
        out << "<li>" << link
      end
    end

    out << "</li>\n"
    (stack.length - 1).downto(0) do |depth|
      out << "</ul>\n"
      out << "</li>\n" if depth.positive?
    end

    out
  end
end

module Jekyll
  module SheetFilters
    def gfm_heading_ids(html)
      CheatSheets.relabel(html)
    end

    def toc(html, max_depth = 3)
      CheatSheets.toc(html, max_depth)
    end
  end
end

Liquid::Template.register_filter(Jekyll::SheetFilters)
