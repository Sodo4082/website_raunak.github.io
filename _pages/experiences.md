---
layout: archive
title: "Experiances"
permalink: /experiences/
author_profile: true
---

# Darpan (college drama club) Play

# Co-convener Adventure and Sports Club

### Kareri Lake

### Kedarkantha




{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
