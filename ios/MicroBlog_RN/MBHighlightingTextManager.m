//
//  MBHighlightingTextManager.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextManager.h"

#import "MBHighlightingTextView.h"
#import "MBHighlightingTextStorage.h"

@implementation MBHighlightingTextManager

RCT_EXPORT_MODULE(MBHighlightingTextView)
//RCT_EXPORT_VIEW_PROPERTY(helloWorld, NSString)

- (UIView *) view
{
  if (UIAccessibilityIsVoiceOverRunning()) {
    // disable highlighting
    self.textStorage = [[NSTextStorage alloc] init];
  }
  else {
    self.textStorage = [[MBHighlightingTextStorage alloc] init];
  }

  // default to screen width?
  CGFloat width = 300;
  
  // setup layout and container
  NSLayoutManager* text_layout = [[NSLayoutManager alloc] init];
  CGSize container_size = CGSizeMake (width, CGFLOAT_MAX);
  NSTextContainer* text_container = [[NSTextContainer alloc] initWithSize:container_size];
  text_container.widthTracksTextView = YES;
  [text_layout addTextContainer:text_container];
  [self.textStorage addLayoutManager:text_layout];

  // make the view
  MBHighlightingTextView* text_view = [[MBHighlightingTextView alloc] initWithFrame:CGRectZero textContainer:text_container];
  text_view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

  // background color
  BOOL darkmode = NO;
  if (@available(iOS 13.0, *)) {
    darkmode = UITraitCollection.currentTraitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
  }
  if (darkmode) {
    text_view.backgroundColor = [UIColor blackColor];
  }
  else {
    text_view.backgroundColor = [UIColor whiteColor];
  }
  
  // default text
  NSString* s = @"";
  NSAttributedString* attr_s = [[NSAttributedString alloc] initWithString:s attributes:@{}];
  text_view.attributedText = attr_s;
  [self.textStorage setAttributedString:attr_s];

  return text_view;
}

@end
