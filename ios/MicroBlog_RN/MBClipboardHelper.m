//
//  MBClipboardHelper.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 6/13/25.
//

#import "MBClipboardHelper.h"

@implementation MBClipboardHelper

RCT_EXPORT_MODULE(MBClipboardHelper);

// expose hasWebURL(): Promise<boolean>
RCT_REMAP_METHOD(hasWebURL, resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    BOOL has_urls = [UIPasteboard generalPasteboard].hasURLs;
    resolve(@(has_urls));
  }
    @catch (NSException* exception) {
    reject(@"pasteboard_error", exception.reason, nil);
  }
}

@end
