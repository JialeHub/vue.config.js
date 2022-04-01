<template>
  <div>
    <el-upload
      ref="ImageUploaderBatchPlus"
      list-type="picture-card"
      class="img-cover draggable-uploader"
      :class="{'uploader-hidden': isHidden}"
      :action="$addBaseURL(uploadPictureURL)"
      :headers="axiosFHeaders"
      :limit="limit"
      :accept="accept"
      :file-list="fileList"
      :on-preview="onPreview"
      :on-change="onChange"
      :on-success="onSuccess"
      :on-remove="onRemove"
      :auto-upload="false">
      <i class="el-icon-plus"></i>
      <div class="el-upload__tip" slot="tip">只能上传{{ accept }}文件，不超过{{ size }}MB，且至多{{ limit }}张</div>
    </el-upload>
    <v-dialog persistent v-model="visible">
      <img width="100%" :src="url" alt="">
    </v-dialog>
    <v-dialog persistent width="700px" v-model="cropperVisible">
      <v-card>
        <v-card-title>图片剪裁</v-card-title>
        <v-card-text>
          <div class="cropper">
            <vueCropper
              ref="cropper"
              :img="options.img"
              :output-size="options.size"
              :output-type="options.outputType"
              :info="options.info"
              :full="options.full"
              :fixed="options.fixed"
              :fixed-number="options.fixedNumber"
              :can-move="options.canMove"
              :can-move-box="options.canMoveBox"
              :fixed-box="options.fixedBox"
              :original="options.original"
              :auto-crop="options.autoCrop"
              :auto-crop-width="options.autoCropWidth"
              :auto-crop-height="options.autoCropHeight"
              :center-box="options.centerBox"
              :high="options.high"
              @imgLoad="imgLoad"/>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" text @click="cropperVisible = false" :disabled="!cropperVisible">取消</v-btn>
          <v-btn color="blue darken-1" text @click="submit" :loading="saveLoading">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {imageLimit} from "@/settings";
import {VueCropper} from 'vue-cropper';
import Sortable from "sortablejs";
import {uploadPictureURL} from "@/api/modules"
import {axiosFHeaders} from "@/api/axios"

export default {
  name: "ImageUploaderBatchPlus",
  components: {VueCropper},
  props: {
    value: {
      type: String,
      default: ""
    },
    size: { // 大小限制(MB)
      type: Number,
      default: imageLimit * 2
    },
    limit: { // 数量限制
      type: Number,
      default: 9
    },
    scale: { // 比例
      type: Array,
      default: () => [1, 1]
    }
  },
  data() {
    return {
      uploadPictureURL,
      axiosFHeaders,
      url: '',
      visible: false,
      saveLoading: false,
      cropperVisible: false,
      isHidden: false,
      isInit: true,
      accept: ".jpg, .png, .jpeg",
      fileList: [],
      options: {
        img: '', // 裁剪图片的地址
        info: false, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式 jpeg、png、webp
        canScale: false, // 图片是否允许滚轮缩放
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: false, // 是否开启截图框宽高固定比例
        fixedNumber: this.scale, // 截图框的宽高比例
        autoCrop: true, // 是否默认生成截图框
        full: false, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        high: true,
        size: 1
      }
    };
  },
  computed: {
    headers() {
      return {
        "Authorization": this.$storeGet.token,
        "Content-Type": "multipart/form-data",
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  },
  mounted() {
    if (this.value) {
      this.init()
    }
    // 拖拽
    this.$nextTick(() => {
      const el = document.querySelectorAll(".draggable-uploader > ul")[0];
      Sortable.create(el, {
        animation: 150,
        onEnd: e => {
          let arr = this.fileList;
          arr.splice(e.newIndex, 0, arr.splice(e.oldIndex, 1)[0]);
          this.$nextTick(() => {
            this.handEmit(arr)
          })
        },
      });
    })
  },
  watch: {
    value(val) {
      if (val && this.isInit) { // 赋值执行
        this.init()
      }
      if (!val) { // 清空执行
        this.reset()
      }
    },
  },
  methods: {
    init() {
      let list = this.value.split(',');
      this.fileList = list.map(item => ({pathUrl: item, url: this.$baseApi + item}));
      this.changeHidden(this.fileList)
      this.isInit = false
    },
    changeHidden(fileList) {
      this.isHidden = fileList.length >= this.limit;
    },
    onPreview(file) {
      this.url = file.url;
      this.visible = true;
    },
    onChange(file, fileList) {
      this.isInit = false
      this.changeHidden(fileList)
      if (file && file.status !== 'success') {
        file = file.raw
        const type = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
        const size = file.size / 1024 / 1024;
        if (!this.accept.includes(type)) {
          let accept = this.accept.replace(/[.]|[,]/g, "");
          this.$errorMsg(`上传图片只能是 ${accept} 格式!`);
          this.reset();
          return false;
        }
        if (size > this.size) {
          this.$errorMsg(`上传图片大小不能超过 ${this.size}MB!`);
          this.reset();
          return false;
        }
        this.$nextTick(() => {
          this.options.img = URL.createObjectURL(file);
          this.cropperVisible = true
        })
      }
    },
    onSuccess(result, file, fileList) {
      if (result.status !== 200) {
        file.status = 'fail'
        this.$errorMsg('上传失败')
        return
      }
      file.pathUrl = result.res[0].path
      this.handEmit(fileList)
    },
    onRemove(file, fileList) {
      this.changeHidden(fileList)
      this.handEmit(fileList)
    },
    handEmit(fileList) {
      this.fileList = fileList;
      let pathStr = '';
      fileList.forEach(item => {
        pathStr = pathStr + `${item.pathUrl},`;
      });
      pathStr = pathStr.substr(0, pathStr.length - 1);
      this.$emit("input", pathStr);
      this.$parent.$emit('el.form.change');
    },
    reset() {
      this.isInit = true
      this.fileList = [];
      this.changeHidden([])
      this.$refs.ImageUploaderBatchPlus.clearFiles();
    },
    imgLoad(msg) {
      if (msg !== 'success') {
        this.$errorMsg("图片加载失败！")
      }
    },
    submit() {
      this.saveLoading=true
      this.$refs.cropper.getCropBlob(data => {
        let uploadFiles = this.$refs.ImageUploaderBatchPlus.uploadFiles
        let index = uploadFiles.length - 1
        let _this = uploadFiles[index]
        data.name = _this.name
        data.uid = _this.raw.uid
        _this.raw = data
        _this.url = URL.createObjectURL(data)
        this.$refs.ImageUploaderBatchPlus.submit()
        this.cropperVisible = false;
        this.saveLoading=false
      })
    }
  }
}
</script>

<style lang="scss">
.uploader-hidden {
  .el-upload--picture-card {
    display: none;
  }
}

.img-cover {
  .img {
    object-fit: cover;
  }
}

.cropper {
  width: 100%;
  height: 340px;
  display: inline-block;
}
</style>
