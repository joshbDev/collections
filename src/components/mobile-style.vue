<style lang="sass">
.desktop-hide {
  display: none;
}
@media (max-width: 1150px) {
  body {
    .search-add-section .glyphicon {
      font-size: 35px;
      top: -40px;
      left: 0;
    }
    .mobile-header {
      background-color: #666;
      left: -20px;
      position: relative;
      width: 110%;
      overflow: hidden;
      top: -20px;
      height: 100px;
      h1 {
        text-align: center;
        margin-top: 30px;
      }
    }
    .desktop-hide {
      display: block;
    }
    .sidebar {
      display: none;
    }
    .browse-page .container.mobile-container {
      left: 0;
      min-width: auto;
    }
    .hide-mobile {
      display: none;
    }
    .collection-item-container {
      height: 150px;
    }
    .collection-item  {
      &.is-open {
        grid-template-columns: repeat(auto-fit, minmax(50px, 100px));
        grid-template-rows: repeat(auto-fit, 150px);
        width: 120%;
      }
      &-title.is-open {
        margin-left: 0;
        margin-top: -140px;
        min-width: 90%;
        &.is-search-open {
          margin-left: 110%;

        }
      }
      .back-to-main {
        left: 0;
        width: 40px;
        height: 40px;
        font-size: 25px;
        &:hover {
          font-size: 27px;
        }
      }
      grid-template-columns: repeat(auto-fit, 50px);
      grid-template-rows: repeat(auto-fit, 0);
      .item-name {
        margin-top: 0;
        position: absolute;
        bottom: 0;
      }
      .image-container.is-open {
        height: 100px;
        width: 100px;
      }
    }
  }
  .album-detail-page {
    height: 90%;
    bottom: -90%;
    display: block;
    overflow: scroll;
    .remove-button {
      position: relative;
    }
  }
  .artist-detail-left-rail {
    position: initial;
    margin-top: 80px;
    left: 0;
  }
  .artist-detail-album-preview .detail-artist-album {
    max-width: 150px;
  }
  .artist-detail-album-preview {
    height: auto;
  }
  .album-detail-page-sidebar .album-detail-page-sidebar-content {
    position: initial;
    margin: 0 auto;
    margin-top: 80px;
    left: 0;
  }
  .track-list-item {
    padding: 20px;
  }
  .collection-item {
    @for $i from 0 through 3 {
      .preview-album-#{$i} {
        left: -$i * 70px;
        top: $i * 10px;
      }
    }
  }
  .collection-item.is-hovered {
  @for $i from 0 through 3 {
    .preview-album-#{$i} {
        left: -$i * 70px;
        top: $i * 10px;
    }
  }
}
}
</style>
